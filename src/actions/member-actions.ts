
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { Member } from '@/lib/types';

const membersCollection = adminDb.collection('members');

const toMemberObject = (doc: FirebaseFirestore.DocumentSnapshot): Member => {
    const data = doc.data();
    let createdAt = new Date().toISOString(); // Default value
    
    if (data?.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toDate().toISOString();
    } else if (typeof data?.createdAt === 'string') {
        createdAt = data.createdAt;
    }

    return {
        id: doc.id,
        name: data?.name,
        email: data?.email,
        role: data?.role,
        joined: data?.joined,
        phone: data?.phone,
        address: data?.address,
        createdAt: createdAt,
    };
};

// CREATE
export async function addMember(memberData: Omit<Member, 'id' | 'createdAt'>): Promise<Member> {
  const docRef = await membersCollection.add({
    ...memberData,
    createdAt: FieldValue.serverTimestamp(),
  });
  const newDoc = await docRef.get();
  return toMemberObject(newDoc);
}

// READ
export async function getMembers(): Promise<Member[]> {
  const q = membersCollection.orderBy("createdAt", "desc");
  const snapshot = await q.get();
  return snapshot.docs.map(toMemberObject);
}

// UPDATE
export async function updateMember(memberData: Omit<Member, 'createdAt'>): Promise<Member> {
  const { id, ...dataToUpdate } = memberData;
  const memberRef = membersCollection.doc(id);
  await memberRef.update({
      ...dataToUpdate,
      updatedAt: FieldValue.serverTimestamp()
  });
  const updatedDoc = await memberRef.get();
  return toMemberObject(updatedDoc);
}

// DELETE
export async function deleteMember(memberId: string): Promise<void> {
    const memberRef = membersCollection.doc(memberId);
    await memberRef.delete();
}
