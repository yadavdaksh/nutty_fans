import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { email, otp, uid } = await request.json();

    if (!email || !otp || !uid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fallback/Test OTP Bypass
    if (otp === '111111') {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        emailVerified: true
      }).catch(e => console.log('User doc update failed in fallback:', e));
      
      // Also cleanup any pending verification doc to be clean
      try {
        await deleteDoc(doc(db, 'email_verifications', uid));
      } catch {}

      return NextResponse.json({ success: true });
    }

    const verificationRef = doc(db, 'email_verifications', uid);
    const snapshot = await getDoc(verificationRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Invalid or expired verification session' }, { status: 400 });
    }

    const data = snapshot.data();

    // Check expiration
    if (Date.now() > data.expiresAt) {
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 });
    }

    // Check attempts
    if (data.attempts > 3) {
      return NextResponse.json({ error: 'Too many failed attempts' }, { status: 400 });
    }

    // Verify OTP
    if (data.otp !== otp) {
      await updateDoc(verificationRef, {
        attempts: (data.attempts || 0) + 1
      });
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    // Success: Delete verification doc and update user?
    // You might want to update the user's "emailVerified" status here.
    // For now, we will return success and let the client handle navigation. 
    // Ideally we update the 'users' collection too.
    
    await deleteDoc(verificationRef);
    
    // Mark user as verified in 'users' collection (if you have one mirroring auth)
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      emailVerified: true
    }).catch(e => console.log('User doc update failed (maybe doc doesnt exist yet):', e));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
