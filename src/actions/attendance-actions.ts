
'use server';

import { adminDb } from '@/lib/firebase-admin';
import {
    FieldValue,
    Timestamp
} from 'firebase-admin/firestore';
import type { AttendanceRecord } from '@/lib/types';

const attendanceCollection = adminDb.collection('attendance');

const toAttendanceRecordObject = (doc: FirebaseFirestore.DocumentSnapshot): AttendanceRecord => {
    const data = doc.data();
    let createdAt = new Date().toISOString(); 

    if (data?.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toDate().toISOString();
    } else if (typeof data?.createdAt === 'string') {
        createdAt = data.createdAt;
    }

    return {
        id: doc.id,
        date: data?.date,
        serviceType: data?.serviceType,
        men: data?.men,
        women: data?.women,
        youth: data?.youth,
        children: data?.children,
        total: data?.total,
        createdAt: createdAt,
    };
};

// CREATE
export async function addAttendanceRecord(recordData: Omit<AttendanceRecord, 'id' | 'createdAt'>): Promise<AttendanceRecord> {
  const docRef = await attendanceCollection.add({
    ...recordData,
    createdAt: FieldValue.serverTimestamp(),
  });
  const newDoc = await docRef.get();
  return toAttendanceRecordObject(newDoc);
}

// READ
export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  const q = attendanceCollection.orderBy("date", "desc");
  const snapshot = await q.get();
  return snapshot.docs.map(toAttendanceRecordObject);
}

// UPDATE
export async function updateAttendanceRecord(recordData: Omit<AttendanceRecord, 'createdAt'>): Promise<AttendanceRecord> {
  const { id, ...dataToUpdate } = recordData;
  const recordRef = attendanceCollection.doc(id);
  
  await recordRef.update({
      ...dataToUpdate,
      updatedAt: FieldValue.serverTimestamp()
  });
  const updatedDoc = await recordRef.get();
  return toAttendanceRecordObject(updatedDoc);
}

// DELETE
export async function deleteAttendanceRecord(recordId: string): Promise<void> {
    const recordRef = attendanceCollection.doc(recordId);
    await recordRef.delete();
}
