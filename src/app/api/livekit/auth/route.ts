import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get('room');
  const username = req.nextUrl.searchParams.get('username');
  const participantName = req.nextUrl.searchParams.get('participantName');

  if (!room || !username || !participantName) {
    return NextResponse.json({ error: 'Missing required query parameters' }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    name: participantName,
  });

  const mode = req.nextUrl.searchParams.get('mode');
  const canPublish = mode === 'publisher';

  at.addGrant({ roomJoin: true, room: room, canPublish: canPublish, canSubscribe: true });

  return NextResponse.json({ token: await at.toJwt() });
}
