'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Church } from '@/lib/types';

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
  const data = docSnap.data();
   if (!data) {
        throw new Error(`Church document ${docSnap.id} has no data.`);
    }
  // This is not a full object but it is what is needed by the caller
  return { id: docSnap.id, ...dataToUpdate } as Church;
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
