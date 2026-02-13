import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Make sure this exports your firestore instance
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendEmail } from '@/lib/email';
import { getOtpEmailTemplate } from '@/lib/email-templates';


// We will use the standard db instance if available or initialize it. 
// In src/lib/db.ts, 'db' is exported.

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email, uid } = await request.json();

    if (!email || !uid) {
      return NextResponse.json({ error: 'Email and UID are required' }, { status: 400 });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP in 'email_verifications' collection
    await setDoc(doc(db, 'email_verifications', uid), {
      email,
      otp,
      expiresAt,
      createdAt: serverTimestamp(),
      attempts: 0
    });

    // Send Email
    const emailHtml = getOtpEmailTemplate(otp);

    await sendEmail(email, 'Verify your Email - NuttyFans', emailHtml);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
