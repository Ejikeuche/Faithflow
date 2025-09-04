
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { Information } from '@/lib/types';

const informationCollection = adminDb.collection('information');

// Helper function to convert Firestore doc to Information object
const toInformationObject = (doc: FirebaseFirestore.DocumentSnapshot): Information => {
    const data = doc.data();
    let createdAt = new Date().toISOString(); 

    if (data?.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toDate().toISOString();
    } else if (typeof data?.createdAt === 'string') {
        createdAt = data.createdAt;
    }
    
    return {
        id: doc.id,
        title: data?.title,
        content: data?.content,
        date: data?.date,
        status: data?.status,
        createdAt: createdAt,
    };
};

// CREATE
export async function addInformation(infoData: Omit<Information, 'id' | 'createdAt'>): Promise<Information> {
  const docRef = await informationCollection.add({
    ...infoData,
    createdAt: FieldValue.serverTimestamp(),
  });
  const newDoc = await docRef.get();
  return toInformationObject(newDoc);
}

// READ
export async function getInformation(): Promise<Information[]> {
  const q = informationCollection.orderBy("date", "desc");
  const snapshot = await q.get();
  return snapshot.docs.map(toInformationObject);
}

// UPDATE
export async function updateInformation(infoData: Omit<Information, 'createdAt'>): Promise<Information> {
  const { id, ...dataToUpdate } = infoData;
  const infoRef = informationCollection.doc(id);
  await infoRef.update({
      ...dataToUpdate,
      updatedAt: FieldValue.serverTimestamp()
  });
  const updatedDoc = await infoRef.get();
  return toInformationObject(updatedDoc);
}

// ARCHIVE
export async function archiveInformation(infoId: string): Promise<void> {
    const infoRef = informationCollection.doc(infoId);
    await infoRef.update({
        status: 'archived',
        updatedAt: FieldValue.serverTimestamp()
    });
}

// DELETE
export async function deleteInformation(infoId: string): Promise<void> {
    const infoRef = informationCollection.doc(infoId);
    await infoRef.delete();
}
