import { adminAuth, adminDb } from './firebase-admin';
import { NextResponse } from 'next/server';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role: 'user' | 'creator' | 'admin';
}

/**
 * Verifies the Firebase ID token from the Authorization header.
 * Optionally checks for a specific role.
 */
export async function verifyAuth(request: Request, requiredRole?: 'user' | 'creator' | 'admin') {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 }) };
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Fetch user role from Firestore (Single source of truth for roles)
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return { error: NextResponse.json({ error: 'User profile not found' }, { status: 404 }) };
    }

    const userData = userDoc.data();
    const role = userData?.role || 'user';

    if (requiredRole && role !== requiredRole) {
      return { error: NextResponse.json({ error: `Unauthorized. ${requiredRole} access required.` }, { status: 403 }) };
    }

    return { 
      user: { 
        uid, 
        email: decodedToken.email, 
        role 
      } as AuthenticatedUser 
    };
  } catch (error) {
    console.error('Auth Verification Error:', error);
    return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
  }
}
