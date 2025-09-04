
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { Offering } from '@/lib/types';

const offeringsCollection = adminDb.collection('offerings');

const toOfferingObject = (doc: FirebaseFirestore.DocumentSnapshot): Offering => {
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
        name: data?.name,
        email: data?.email,
        amount: data?.amount,
        date: data?.date,
        type: data?.type,
        createdAt: toISOString(data?.createdAt),
    };
};

// CREATE
export async function addOffering(offeringData: Omit<Offering, 'id' | 'createdAt'>): Promise<Offering> {
  const docRef = await offeringsCollection.add({
    ...offeringData,
    createdAt: FieldValue.serverTimestamp(),
  });
  const newDoc = await docRef.get();
  return toOfferingObject(newDoc);
}

// CREATE BATCH
export async function addBatchOfferings(offeringsData: Omit<Offering, 'id' | 'createdAt'>[]): Promise<void> {
    const batch = adminDb.batch();

    offeringsData.forEach(offering => {
        const docRef = offeringsCollection.doc();
        batch.set(docRef, {
            ...offering,
            createdAt: FieldValue.serverTimestamp()
        });
    });

    await batch.commit();
}


// READ
export async function getOfferings(): Promise<Offering[]> {
  const q = offeringsCollection.orderBy("date", "desc");
  const snapshot = await q.get();
  return snapshot.docs.map(toOfferingObject);
}

// UPDATE
export async function updateOffering(offeringData: Omit<Offering, 'createdAt'>): Promise<Offering> {
  const { id, ...dataToUpdate } = offeringData;
  const offeringRef = offeringsCollection.doc(id);

  await offeringRef.update({
      ...dataToUpdate,
      updatedAt: FieldValue.serverTimestamp()
  });
  const updatedDoc = await offeringRef.get();
  return toOfferingObject(updatedDoc);
}

// DELETE
export async function deleteOffering(offeringId: string): Promise<void> {
    const offeringRef = offeringsCollection.doc(offeringId);
    await offeringRef.delete();
}
