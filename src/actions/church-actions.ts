
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';
import type { Church } from '@/lib/types';

const churchesCollection = collection(db, 'churches');

// Helper function to convert Firestore doc to Church object
const toChurchObject = (doc: any): Church => {
    const data = doc.data();
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
        // Convert timestamp to string if it exists
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
    };
};

// CREATE
export async function addChurch(churchData: Omit<Church, 'id' | 'createdAt'>): Promise<Church> {
  const docRef = await addDoc(churchesCollection, {
    ...churchData,
    createdAt: serverTimestamp(),
  });
  // Fetch the document back to get the server-generated timestamp
  const newDoc = await getDoc(docRef);
  return toChurchObject(newDoc);
}

// READ
export async function getChurches(): Promise<Church[]> {
  const q = query(churchesCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(toChurchObject);
}

// UPDATE
export async function updateChurch(churchData: Omit<Church, 'createdAt'>): Promise<Church> {
  const churchRef = doc(db, 'churches', churchData.id);
  const { id, ...dataToUpdate } = churchData;
  await updateDoc(churchRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp()
  });
  const updatedDoc = await getDoc(churchRef);
  return toChurchObject(updatedDoc);
}
