
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { Church } from '@/lib/types';

const churchesCollection = adminDb.collection('churches');

// Helper function to convert Firestore doc to Church object
const toChurchObject = (doc: FirebaseFirestore.DocumentSnapshot): Church => {
    const data = doc.data();
    let createdAt = new Date().toISOString(); // Default value

    if (data?.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toDate().toISOString();
    } else if (typeof data?.createdAt === 'string') {
        createdAt = data.createdAt;
    }
    
    return {
        id: doc.id,
        name: data?.name,
        location: data?.location,
        members: data?.members,
        status: data?.status,
        pastor: data?.pastor,
        email: data?.email,
        phone: data?.phone,
        website: data?.website,
        createdAt: createdAt,
    };
};

// CREATE
export async function addChurch(churchData: Omit<Church, 'id' | 'createdAt'>): Promise<Church> {
  const docRef = await churchesCollection.add({
    ...churchData,
    createdAt: FieldValue.serverTimestamp(),
  });
  // Fetch the document back to get the server-generated timestamp
  const newDoc = await docRef.get();
  return toChurchObject(newDoc);
}

// READ
export async function getChurches(): Promise<Church[]> {
  const q = churchesCollection.orderBy("createdAt", "desc");
  const snapshot = await q.get();
  return snapshot.docs.map(toChurchObject);
}

// UPDATE
export async function updateChurch(churchData: Omit<Church, 'createdAt'>): Promise<Church> {
    const { id, ...dataToUpdate } = churchData;
    const churchRef = churchesCollection.doc(id);

    await churchRef.update({
        ...dataToUpdate,
        updatedAt: FieldValue.serverTimestamp()
    });
    const updatedDoc = await churchRef.get();
    return toChurchObject(updatedDoc);
}
