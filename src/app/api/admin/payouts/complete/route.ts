import { NextResponse } from 'next/server';
import { db, getUserProfile, updatePayoutRequestStatus } from '@/lib/db';
import { createMercuryRecipient, triggerMercuryPayout } from '@/lib/mercury';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payoutRequestId, adminUserId } = body;

    if (!payoutRequestId || !adminUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify Admin Status
    const adminProfile = await getUserProfile(adminUserId);
    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // 2. Fetch Payout Request
    const payoutRef = doc(db, 'payout_requests', payoutRequestId);
    const payoutSnap = await getDoc(payoutRef);

    if (!payoutSnap.exists()) {
      return NextResponse.json({ error: 'Payout request not found' }, { status: 404 });
    }

    const payoutData = payoutSnap.data();
    if (payoutData.status !== 'pending') {
      return NextResponse.json({ error: 'Payout request is no longer pending' }, { status: 400 });
    }

    const creatorId = payoutData.userId;
    const amount = payoutData.amount; // in cents
    const bankDetails = payoutData.bankDetails;

    // 3. Get or Create Mercury Recipient
    const creatorProfile = await getUserProfile(creatorId);
    let mercuryRecipientId = creatorProfile?.mercuryRecipientId;

    if (!mercuryRecipientId) {
      console.log(`Creating new Mercury recipient for creator ${creatorId}`);
      try {
        mercuryRecipientId = await createMercuryRecipient({
          accountNumber: bankDetails.accountNumber,
          routingNumber: bankDetails.routingNumber || '',
          accountHolderName: bankDetails.accountHolderName,
          emails: [creatorProfile?.email || ''],
          country: bankDetails.country || 'US',
        });

        // Save recipient ID to creator profile for future use
        await updateDoc(doc(db, 'users', creatorId), {
          mercuryRecipientId: mercuryRecipientId,
        });
      } catch (err) {
        console.error('Mercury Recipient Creation Failed:', err);
        return NextResponse.json({ error: `Mercury recipient creation failed: ${(err as Error).message}` }, { status: 500 });
      }
    }

    // 4. Trigger Mercury Payout
    if (!mercuryRecipientId) {
      return NextResponse.json({ error: 'Failed to obtain Mercury recipient ID' }, { status: 500 });
    }

    console.log(`Triggering Mercury payout of ${amount} cents to recipient ${mercuryRecipientId}`);
    try {
      const mercuryResponse = await triggerMercuryPayout(
        mercuryRecipientId,
        amount,
        `payout_${payoutRequestId}`, // Idempotency key
        `Payout for Request ${payoutRequestId}`
      );

      console.log('Mercury Payout Triggered Successfully:', mercuryResponse);

      // 5. Update Firestore Status
      await updatePayoutRequestStatus(payoutRequestId, 'paid', `Automated via Mercury. Tx ID: ${mercuryResponse.id}`);

      return NextResponse.json({
        success: true,
        mercuryTransactionId: mercuryResponse.id,
      });

    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('Mercury Payout Trigger Failed:', err);

      // Special handling for deleted recipient
      if (errorMessage.toLowerCase().includes('deleted')) {
        console.log(`Clearing deleted Mercury recipient ID ${mercuryRecipientId} for creator ${creatorId}`);
        await updateDoc(doc(db, 'users', creatorId), {
          mercuryRecipientId: null
        });
        return NextResponse.json({ 
          error: 'The saved recipient was deleted in Mercury. I have cleared the record—please click "Approve & Pay" again to generate a fresh, valid recipient.' 
        }, { status: 400 });
      }

      // We don't update status to 'failed' yet to allow retry,
      // but we return the error to the admin.
      return NextResponse.json({ error: `Mercury payout failed: ${errorMessage}` }, { status: 500 });
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
