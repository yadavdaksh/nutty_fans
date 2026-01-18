import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { subject, content, target, creatorId } = await request.json();

    if (!subject || !content || !creatorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify Creator Exists
    const creatorRef = doc(db, 'creators', creatorId);
    const creatorSnap = await getDoc(creatorRef);
    
    if (!creatorSnap.exists()) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // 2. Fetch Subscriptions based on Target
    const subsRef = collection(db, 'subscriptions');
    let q;

    if (target === 'active') {
        // Current Members: Status is active AND expiresAt > now
        // Note: Firestore query limitations might require client-side filtering for complex Date checks combined with other fields index
        // For MVP we fetch active status and filter dates in memory if needed, or rely on status management
        q = query(subsRef, where('creatorId', '==', creatorId), where('status', '==', 'active'));
    } else if (target === 'past') {
        // Past Members: Status is cancelled or expired
        q = query(subsRef, where('creatorId', '==', creatorId), where('status', 'in', ['cancelled', 'expired']));
    } else {
        // All Members
        q = query(subsRef, where('creatorId', '==', creatorId));
    }

    const subsSnap = await getDocs(q);
    const userIds = subsSnap.docs.map(doc => doc.data().userId);
    const uniqueUserIds = [...new Set(userIds)];

    if (uniqueUserIds.length === 0) {
      return NextResponse.json({ error: 'No recipients found for this group.' }, { status: 404 });
    }

    // 3. Fetch User Emails (Batching for Firestore 'in' query limit of 10)
    // We will do it in chunks of 10
    const emails: string[] = [];
    const chunks = [];
    
    for (let i = 0; i < uniqueUserIds.length; i += 10) {
        chunks.push(uniqueUserIds.slice(i, i + 10));
    }

    const usersRef = collection(db, 'users');
    
    for (const chunk of chunks) {
        if (chunk.length === 0) continue;
        const usersQ = query(usersRef, where('uid', 'in', chunk));
        const usersSnap = await getDocs(usersQ);
        usersSnap.docs.forEach(doc => {
            const email = doc.data().email;
            if (email) emails.push(email);
        });
    }

    // 4. Send Emails
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log(`Sending creator newsletter to ${emails.length} users...`);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
       console.warn('EMAIL_USER or EMAIL_PASS not set. Simulated send successful.');
    } else {
       // Send individually to protect privacy (or use BCC if list is small, but individual is safer for deliverability/privacy)
       // Warning: This loop can be slow for large lists. For MVP it's acceptable.
       const emailPromises = emails.map(email => 
         transporter.sendMail({
           from: `"NuttyFans Creator Updates" <noreply@nuttyfans.com>`, // Generic platform sender
           replyTo: process.env.EMAIL_USER, // Or creator's email if we wanted to expose it
           to: email,
           subject: `${subject} - Update from Creator`, // Value extraction needed here? No, 'subject' is passed in
           html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <div style="background: #fdfbfd; padding: 40px; border-radius: 20px 20px 0 0; border: 1px solid #eee; border-bottom: none;">
                <h1 style="color: #9810fa; margin: 0; font-size: 24px;">New Update from Creator</h1>
              </div>
              <div style="padding: 40px; background: white; border: 1px solid #eee; border-top: none; border-radius: 0 0 20px 20px;">
                <h2 style="margin-top: 0;">${subject}</h2>
                <div style="line-height: 1.6; color: #555;">
                  ${content}
                </div>
              </div>
              <div style="padding: 20px; text-align: center; font-size: 12px; color: #999;">
                &copy; ${new Date().getFullYear()} NuttyFans. <br/>
                You received this email because you subscribed to this creator. 
              </div>
            </div>
           `
         })
       );
       
       await Promise.all(emailPromises);
    }

    return NextResponse.json({ success: true, count: emails.length });

  } catch (error) {
    console.error('Creator Newsletter Error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to send' }, { status: 500 });
  }
}
