
'use server';

import { db } from '@/lib/firebase';
import {
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy,
    getDoc,
    Timestamp
} from 'firebase/firestore';
import type { Information } from '@/lib/types';

const informationCollection = collection(db, 'information');

// Helper function to convert Firestore doc to Information object
const toInformationObject = (doc: any): Information => {
    const data = doc.data();
    let createdAt = new Date().toISOString(); 

    if (data.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toDate().toISOString();
    } else if (typeof data.createdAt === 'string') {
        createdAt = data.createdAt;
    }
    
    return {
        id: doc.id,
        title: data.title,
        content: data.content,
        date: data.date,
        status: data.status,
        createdAt: createdAt,
    };
};

// CREATE
export async function addInformation(infoData: Omit<Information, 'id' | 'createdAt'>): Promise<Information> {
  const docRef = await addDoc(informationCollection, {
    ...infoData,
    createdAt: serverTimestamp(),
  });
  const newDoc = await getDoc(docRef);
  return toInformationObject(newDoc);
}

// READ
export async function getInformation(): Promise<Information[]> {
  const q = query(informationCollection, orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(toInformationObject);
}

// UPDATE
export async function updateInformation(infoData: Omit<Information, 'createdAt'>): Promise<Information> {
  const infoRef = doc(db, 'information', infoData.id);
  const { id, ...dataToUpdate } = infoData;
  await updateDoc(infoRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp()
  });
  const updatedDoc = await getDoc(infoRef);
  return toInformationObject(updatedDoc);
}

// ARCHIVE
export async function archiveInformation(infoId: string): Promise<void> {
    const infoRef = doc(db, 'information', infoId);
    await updateDoc(infoRef, {
        status: 'archived',
        updatedAt: serverTimestamp()
    });
}

// DELETE
export async function deleteInformation(infoId: string): Promise<void> {
    const infoRef = doc(db, 'information', infoId);
    await deleteDoc(infoRef);
}
