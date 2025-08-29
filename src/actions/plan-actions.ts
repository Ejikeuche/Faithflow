
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, serverTimestamp, writeBatch, query, orderBy } from 'firebase/firestore';
import type { Plan } from '@/lib/types';

const plansCollection = collection(db, 'plans');

const initialPlans: Omit<Plan, 'id'>[] = [
  {
    name: "Basic",
    memberLimit: { min: 0, max: 100 },
    price: 29,
  },
  {
    name: "Premium",
    memberLimit: { min: 101, max: 250 },
    price: 79,
  },
  {
    name: "Premium Plus",
    memberLimit: { min: 251, max: null },
    price: 149,
  },
];

// Helper function to convert Firestore doc to Plan object
const toPlanObject = (doc: any): Plan => {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        memberLimit: data.memberLimit,
        price: data.price,
    };
};

// Initialize Plans
async function initializePlans(): Promise<Plan[]> {
    const batch = writeBatch(db);
    const createdPlans: Plan[] = [];

    const planIds = ["basic", "premium", "premium-plus"];

    initialPlans.forEach((planData, index) => {
        const planId = planIds[index];
        const docRef = doc(db, 'plans', planId);
        const data = { ...planData, createdAt: serverTimestamp() };
        batch.set(docRef, data);
        createdPlans.push({ ...planData, id: planId });
    });

    await batch.commit();
    return createdPlans.sort((a,b) => a.memberLimit.min - b.memberLimit.min);
}


// READ
export async function getPlans(): Promise<Plan[]> {
  const snapshot = await getDocs(query(plansCollection));
  if (snapshot.empty) {
      // If no plans exist, initialize them
      return await initializePlans();
  }

  const plans = snapshot.docs.map(toPlanObject);
  // Sort by member limit to ensure consistent order
  return plans.sort((a,b) => a.memberLimit.min - b.memberLimit.min);
}

// UPDATE
export async function updatePlan(planData: Plan): Promise<Plan> {
  const planRef = doc(db, 'plans', planData.id);
  const { id, ...dataToUpdate } = planData;
  await updateDoc(planRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp()
  });
  return planData;
}
