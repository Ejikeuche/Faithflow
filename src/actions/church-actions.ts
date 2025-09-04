
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Church } from '@/lib/types';

// Helper function to convert Firestore doc to Church object
const toChurchObject = (doc: FirebaseFirestore.DocumentSnapshot): Church => {
    const data = doc.data();
    if (!data) {
        throw new Error(`Church document ${doc.id} has no data.`);
    }
    return {
        id: doc.id,
        name: data.name,
        location: data.location,
        members: data.members,
        status: data.status,
        pastor: data.pastor,
        email: data.email,
        phone: data.phone,
        website: data.website,
        createdAt: data.createdAt.toDate().toISOString(),
    };
};

// READ
export async function getChurches(): Promise<Church[]> {
  try {
    const churchesCollection = adminDb.collection('churches');
    const snapshot = await churchesCollection.orderBy("createdAt", "desc").get();
    
    if (snapshot.empty) {
        return [];
    }

    const churches = snapshot.docs.map(toChurchObject);
    return churches;
  } catch (error) {
    console.error("Error in getChurches:", error);
    throw new Error("Failed to fetch churches due to a server error.");
  }
}

// CREATE
export async function addChurch(churchData: Omit<Church, 'id' | 'createdAt'>): Promise<Church> {
    const churchesCollection = adminDb.collection('churches');
    const newChurchRef = churchesCollection.doc();
    const dataToAdd = {
        ...churchData,
        createdAt: FieldValue.serverTimestamp()
    };
    await newChurchRef.set(dataToAdd);

    return { id: newChurchRef.id, ...churchData, createdAt: new Date().toISOString() };
}


// UPDATE
export async function updateChurch(churchData: Omit<Church, 'createdAt'>): Promise<Church> {
  const churchesCollection = adminDb.collection('churches');
  const { id, ...dataToUpdate } = churchData;
  const churchRef = churchesCollection.doc(id);

  await churchRef.update({
      ...dataToUpdate,
      updatedAt: FieldValue.serverTimestamp()
  });
  
  const docSnap = await churchRef.get();
  return toChurchObject(docSnap);
}

// DELETE
export async function deleteChurch(churchId: string): Promise<void> {
    const churchRef = adminDb.collection('churches').doc(churchId);
    await churchRef.delete();
}

// UPDATE STATUS
export async function updateChurchStatus(churchId: string, status: 'Active' | 'Inactive'): Promise<void> {
    const churchRef = adminDb.collection('churches').doc(churchId);
    await churchRef.update({
        status,
        updatedAt: FieldValue.serverTimestamp()
    });
}
