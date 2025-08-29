
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
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import type { Offering } from '@/lib/types';

const offeringsCollection = collection(db, 'offerings');

const toOfferingObject = (doc: any): Offering => {
    const data = doc.data();
    
    // Helper to safely convert timestamp to ISO string
    const toISOString = (timestamp: any) => {
        if (timestamp instanceof Timestamp) {
            return timestamp.toDate().toISOString();
        }
        if(typeof timestamp === 'string') {
            return timestamp;
        }
        return new Date().toISOString();
    };

    return {
        id: doc.id,
        name: data.name,
        email: data.email,
        amount: data.amount,
        date: data.date,
        type: data.type,
        createdAt: toISOString(data.createdAt),
    };
};

// CREATE
export async function addOffering(offeringData: Omit<Offering, 'id' | 'createdAt'>): Promise<Offering> {
  const docRef = await addDoc(offeringsCollection, {
    ...offeringData,
    createdAt: serverTimestamp(),
  });
  const newDoc = await getDoc(docRef);
  return toOfferingObject(newDoc);
}

// CREATE BATCH
export async function addBatchOfferings(offeringsData: Omit<Offering, 'id' | 'createdAt'>[]): Promise<void> {
    const batch = writeBatch(db);

    offeringsData.forEach(offering => {
        const docRef = doc(offeringsCollection);
        batch.set(docRef, {
            ...offering,
            createdAt: serverTimestamp()
        });
    });

    await batch.commit();
}


// READ
export async function getOfferings(): Promise<Offering[]> {
  const q = query(offeringsCollection, orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(toOfferingObject);
}

// UPDATE
export async function updateOffering(offeringData: Omit<Offering, 'createdAt'>): Promise<Offering> {
  const offeringRef = doc(db, 'offerings', offeringData.id);
  const { id, ...dataToUpdate } = offeringData;
  await updateDoc(offeringRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp()
  });
  const updatedDoc = await getDoc(offeringRef);
  return toOfferingObject(updatedDoc);
}

// DELETE
export async function deleteOffering(offeringId: string): Promise<void> {
    const offeringRef = doc(db, 'offerings', offeringId);
    await deleteDoc(offeringRef);
}
