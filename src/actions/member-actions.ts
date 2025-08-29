
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
import type { Member } from '@/lib/types';

const membersCollection = collection(db, 'members');

const toMemberObject = (doc: any): Member => {
    const data = doc.data();
    let createdAt = new Date().toISOString(); // Default value
    
    if (data.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toDate().toISOString();
    } else if (typeof data.createdAt === 'string') {
        createdAt = data.createdAt;
    }

    return {
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        joined: data.joined,
        phone: data.phone,
        address: data.address,
        createdAt: createdAt,
    };
};

// CREATE
export async function addMember(memberData: Omit<Member, 'id' | 'createdAt'>): Promise<Member> {
  const docRef = await addDoc(membersCollection, {
    ...memberData,
    createdAt: serverTimestamp(),
  });
  const newDoc = await getDoc(docRef);
  return toMemberObject(newDoc);
}

// READ
export async function getMembers(): Promise<Member[]> {
  const q = query(membersCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(toMemberObject);
}

// UPDATE
export async function updateMember(memberData: Omit<Member, 'createdAt'>): Promise<Member> {
  const memberRef = doc(db, 'members', memberData.id);
  const { id, ...dataToUpdate } = memberData;
  await updateDoc(memberRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp()
  });
  const updatedDoc = await getDoc(memberRef);
  return toMemberObject(updatedDoc);
}

// DELETE
export async function deleteMember(memberId: string): Promise<void> {
    const memberRef = doc(db, 'members', memberId);
    await deleteDoc(memberRef);
}
