import { NextResponse } from 'next/server';
import { adminAuth, adminDb, adminRtdb, adminStorage } from '@/lib/firebase-admin';

export async function POST() {
  if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_RESET_IN_PROD) {
      return NextResponse.json({ error: 'Reset not allowed in production' }, { status: 403 });
  }

  try {
    // 1. Delete all users from Authentication
    await deleteAllUsers();

    // 2. Delete all data from Realtime Database
    await deleteRealtimeDb();

    // 3. Delete all files from Storage
    await deleteAllStorageFiles();

    // 4. Delete all collections from Firestore
    await deleteAllFirestoreData();

    return NextResponse.json({ message: 'All data reset successfully' });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

async function deleteAllUsers(nextPageToken?: string) {
  const listUsersResult = await adminAuth.listUsers(1000, nextPageToken);
  const uids = listUsersResult.users.map((userRecord) => userRecord.uid);

  if (uids.length > 0) {
    await adminAuth.deleteUsers(uids);
    console.log(`Deleted ${uids.length} users`);
  }

  if (listUsersResult.pageToken) {
    await deleteAllUsers(listUsersResult.pageToken);
  }
}

async function deleteRealtimeDb() {
    const ref = adminRtdb.ref('/');
    await ref.remove();
    console.log('Realtime DB cleared');
}

async function deleteAllStorageFiles() {
    const bucket = adminStorage.bucket();
    const [files] = await bucket.getFiles({ prefix: '' }); // Get all files

    if (files.length > 0) {
        // Delete in parallel chunks to avoid timeouts if many files
        const deletePromises = files.map(file => file.delete());
        await Promise.all(deletePromises);
        console.log(`Deleted ${files.length} files from storage`);
    }
}

async function deleteAllFirestoreData() {
    const collections = await adminDb.listCollections();
    for (const collection of collections) {
        await deleteCollection(collection.path);
    }
    console.log('All Firestore collections deleted');
}

async function deleteCollection(collectionPath: string, batchSize: number = 500) {
    const collectionRef = adminDb.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(adminDb, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db: FirebaseFirestore.Firestore, query: FirebaseFirestore.Query, resolve: (value?: unknown) => void) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    const batch = db.batch();
    const subcollectionPromises: Promise<unknown>[] = [];

    for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        
        // Manual check for known subcollections.
        // Generic recursive delete is costly, so we target known structures.
        // For 'conversations', we know there are 'messages'.
        const subcollections = await doc.ref.listCollections();
        for (const subcol of subcollections) {
            subcollectionPromises.push(deleteCollection(subcol.path));
        }
    }

    await Promise.all(subcollectionPromises);
    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}
