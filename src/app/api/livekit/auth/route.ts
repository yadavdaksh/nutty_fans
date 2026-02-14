import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    // 1. [SECURITY] Auth Verification
    const { user, error } = await verifyAuth(req);
    if (error) return error;

    const room = req.nextUrl.searchParams.get('room');
    const participantName = req.nextUrl.searchParams.get('participantName');

    if (!room || !participantName) {
      return NextResponse.json({ error: 'Missing required query parameters' }, { status: 400 });
    }

    // 2. [SECURITY] Stream Access Verification
    // Fetch stream details from Firestore using Admin SDK
    const streamSnap = await adminDb.collection('streams').doc(room).get();
    
    if (!streamSnap.exists) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const streamData = streamSnap.data();
    if (!streamData?.isActive) {
      return NextResponse.json({ error: 'Stream is offline' }, { status: 403 });
    }

    const isCreator = user.uid === streamData.creatorId;
    let hasAccess = isCreator;

    if (!hasAccess) {
      if (streamData.accessType === 'public') {
        hasAccess = true;
      } else if (streamData.accessType === 'subscribers') {
        // Check subscription status
        const subSnap = await adminDb.collection('subscriptions')
          .where('userId', '==', user.uid)
          .where('creatorId', '==', streamData.creatorId)
          .where('status', 'in', ['active', 'expiring'])
          .get();
        hasAccess = !subSnap.empty;
      } else if (streamData.accessType === 'paid') {
        // Check purchase status
        const purchaseSnap = await adminDb.collection('stream_purchases')
          .where('userId', '==', user.uid)
          .where('streamId', '==', room)
          .get();
        hasAccess = !purchaseSnap.empty;
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized. Access requirements not met.' }, { status: 403 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // Use verified UID for identity to prevent spoofing
    const viewerIdentity = isCreator ? user.uid : `${user.uid}-viewer-${Date.now()}`;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: viewerIdentity,
      name: participantName,
    });

    const mode = req.nextUrl.searchParams.get('mode');
    const canPublish = mode === 'publisher' && isCreator; // Only creators can publish

    at.addGrant({ 
      roomJoin: true, 
      room: room, 
      canPublish: canPublish, 
      canSubscribe: true,
      canPublishData: true 
    });

    return NextResponse.json({ token: await at.toJwt() });
  } catch (error) {
    console.error('LiveKit Auth Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
