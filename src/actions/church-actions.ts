'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import type { Church } from '@/lib/types';

const churchesCollection = collection(db, 'churches');

// CREATE
export async function addChurch(churchData: Omit<Church, 'id'>): Promise<Church> {
  const docRef = await addDoc(churchesCollection, {
    ...churchData,
    createdAt: serverTimestamp(),
  });
  return { ...churchData, id: docRef.id };
}

// READ
export async function getChurches(): Promise<Church[]> {
  const q = query(churchesCollection, orderBy("name"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Church));
}

// UPDATE
export async function updateChurch(churchData: Church): Promise<Church> {
  const churchRef = doc(db, 'churches', churchData.id);
  const { id, ...dataToUpdate } = churchData;
  await updateDoc(churchRef, dataToUpdate);
  return churchData;
}
