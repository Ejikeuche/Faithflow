
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { SundaySchoolLesson } from '@/lib/types';

const lessonsCollection = adminDb.collection('sundaySchoolLessons');

// Helper function to convert Firestore doc to SundaySchoolLesson object
const toLessonObject = (doc: FirebaseFirestore.DocumentSnapshot): SundaySchoolLesson => {
    const data = doc.data();
    let createdAt = new Date().toISOString(); 

    if (data?.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toDate().toISOString();
    } else if (typeof data?.createdAt === 'string') {
        createdAt = data.createdAt;
    }
    
    return {
        id: doc.id,
        title: data?.title,
        description: data?.description,
        content: data?.content,
        date: data?.date,
        createdAt: createdAt,
    };
};

// CREATE
export async function addLesson(lessonData: Omit<SundaySchoolLesson, 'id' | 'createdAt'>): Promise<SundaySchoolLesson> {
  const docRef = await lessonsCollection.add({
    ...lessonData,
    createdAt: FieldValue.serverTimestamp(),
  });
  const newDoc = await docRef.get();
  return toLessonObject(newDoc);
}

// READ
export async function getLessons(): Promise<SundaySchoolLesson[]> {
  const q = lessonsCollection.orderBy("date", "desc");
  const snapshot = await q.get();
  return snapshot.docs.map(toLessonObject);
}

// UPDATE
export async function updateLesson(lessonData: Omit<SundaySchoolLesson, 'createdAt'>): Promise<SundaySchoolLesson> {
  const { id, ...dataToUpdate } = lessonData;
  const lessonRef = lessonsCollection.doc(id);

  await lessonRef.update({
      ...dataToUpdate,
      updatedAt: FieldValue.serverTimestamp()
  });
  const updatedDoc = await lessonRef.get();
  return toLessonObject(updatedDoc);
}

// DELETE
export async function deleteLesson(lessonId: string): Promise<void> {
    const lessonRef = lessonsCollection.doc(lessonId);
    await lessonRef.delete();
}
