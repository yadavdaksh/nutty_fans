import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { uid, action, adminUid } = await request.json();

    if (!uid || !action || !adminUid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify that the requester is an admin
    const adminSnap = await adminDb.collection('users').doc(adminUid).get();
    const adminData = adminSnap.data();

    if (!adminData || adminData.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    if (action === 'approve') {
      // 2. Update status to approved
      await adminDb.collection('users').doc(uid).update({
        verificationStatus: 'approved'
      });

      // 3. Send approval email
      const userSnap = await adminDb.collection('users').doc(uid).get();
      const userData = userSnap.data();
      
      if (userData?.email) {
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 12px;">
            <h2 style="color: #4f46e5;">Welcome to NuttyFans!</h2>
            <p>Great news! Your creator account has been approved by our team.</p>
            <p>You can now log in to your dashboard and start sharing content with your fans.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://nuttyfans.com'}/login" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Login to Your Account</a>
            </div>
            <p style="color: #666; font-size: 14px;">If you have any questions, feel free to reply to this email.</p>
          </div>
        `;
        await sendEmail(userData.email, 'Your NuttyFans Creator Account is Approved!', emailHtml);
      }

      return NextResponse.json({ success: true, message: 'Creator approved successfully' });

    } else if (action === 'reject') {
      // 2. Delete data for rejected creator
      const userSnap = await adminDb.collection('users').doc(uid).get();
      const userData = userSnap.data();

      // Delete from Auth
      await adminAuth.deleteUser(uid);

      // Delete from Firestore
      await adminDb.collection('users').doc(uid).delete();
      await adminDb.collection('creators').doc(uid).delete();
      
      // Delete other related data if needed (e.g., email_verifications)
      await adminDb.collection('email_verifications').doc(uid).delete();

      // Send rejection email (Optional but good practice)
      if (userData?.email) {
          const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 12px;">
              <h2 style="color: #ef4444;">Account Application Status</h2>
              <p>Hello,</p>
              <p>We have reviewed your creator application for NuttyFans. Unfortunately, we are unable to approve your account at this time as it does not meet our minimum guidelines.</p>
              <p>As per our policy for rejected applications, your account and submitted data have been deleted from our system.</p>
              <p>You are welcome to try creating a new account in the future with updated information.</p>
              <p style="color: #666; font-size: 14px;">Regards,<br/>The NuttyFans Team</p>
            </div>
          `;
          await sendEmail(userData.email, 'Update on your NuttyFans application', emailHtml);
      }

      return NextResponse.json({ success: true, message: 'Creator rejected and account deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in verify-creator API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
