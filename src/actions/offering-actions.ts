
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Offering } from '@/lib/types';

const offeringsCollection = adminDb.collection('offerings');

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
