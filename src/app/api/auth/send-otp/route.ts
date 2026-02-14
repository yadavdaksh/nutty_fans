import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendEmail } from '@/lib/email';
import { getOtpEmailTemplate } from '@/lib/email-templates';
import { verifyAuth } from '@/lib/api-auth';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    // 1. [SECURITY] Auth Verification
    const { user, error } = await verifyAuth(request);
    if (error) return error;

    const { email } = await request.json();
    const uid = user.uid; // Always use verified UID

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
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
