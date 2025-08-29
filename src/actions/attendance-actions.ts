
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
import type { AttendanceRecord } from '@/lib/types';

const attendanceCollection = collection(db, 'attendance');

const toAttendanceRecordObject = (doc: any): AttendanceRecord => {
    const data = doc.data();
    let createdAt = new Date().toISOString(); 

    if (data.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toDate().toISOString();
    } else if (typeof data.createdAt === 'string') {
        createdAt = data.createdAt;
    }

    return {
        id: doc.id,
        date: data.date,
        serviceType: data.serviceType,
        men: data.men,
        women: data.women,
        youth: data.youth,
        children: data.children,
        total: data.total,
        createdAt: createdAt,
    };
};

// CREATE
export async function addAttendanceRecord(recordData: Omit<AttendanceRecord, 'id' | 'createdAt'>): Promise<AttendanceRecord> {
  const docRef = await addDoc(attendanceCollection, {
    ...recordData,
    createdAt: serverTimestamp(),
  });
  const newDoc = await getDoc(docRef);
  return toAttendanceRecordObject(newDoc);
}

// READ
export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  const q = query(attendanceCollection, orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(toAttendanceRecordObject);
}

// UPDATE
export async function updateAttendanceRecord(recordData: Omit<AttendanceRecord, 'createdAt'>): Promise<AttendanceRecord> {
  const recordRef = doc(db, 'attendance', recordData.id);
  const { id, ...dataToUpdate } = recordData;
  await updateDoc(recordRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp()
  });
  const updatedDoc = await getDoc(recordRef);
  return toAttendanceRecordObject(updatedDoc);
}

// DELETE
export async function deleteAttendanceRecord(recordId: string): Promise<void> {
    const recordRef = doc(db, 'attendance', recordId);
    await deleteDoc(recordRef);
}
