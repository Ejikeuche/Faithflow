
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
import type { SundaySchoolLesson } from '@/lib/types';

const lessonsCollection = collection(db, 'sundaySchoolLessons');

// Helper function to convert Firestore doc to SundaySchoolLesson object
const toLessonObject = (doc: any): SundaySchoolLesson => {
    const data = doc.data();
    let createdAt = new Date().toISOString(); 

    if (data.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toDate().toISOString();
    } else if (typeof data.createdAt === 'string') {
        createdAt = data.createdAt;
    }
    
    return {
        id: doc.id,
        title: data.title,
        description: data.description,
        content: data.content,
        date: data.date,
        createdAt: createdAt,
    };
};

// CREATE
export async function addLesson(lessonData: Omit<SundaySchoolLesson, 'id' | 'createdAt'>): Promise<SundaySchoolLesson> {
  const docRef = await addDoc(lessonsCollection, {
    ...lessonData,
    createdAt: serverTimestamp(),
  });
  const newDoc = await getDoc(docRef);
  return toLessonObject(newDoc);
}

// READ
export async function getLessons(): Promise<SundaySchoolLesson[]> {
  const q = query(lessonsCollection, orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(toLessonObject);
}

// UPDATE
export async function updateLesson(lessonData: Omit<SundaySchoolLesson, 'createdAt'>): Promise<SundaySchoolLesson> {
  const lessonRef = doc(db, 'sundaySchoolLessons', lessonData.id);
  const { id, ...dataToUpdate } = lessonData;
  await updateDoc(lessonRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp()
  });
  const updatedDoc = await getDoc(lessonRef);
  return toLessonObject(updatedDoc);
}

// DELETE
export async function deleteLesson(lessonId: string): Promise<void> {
    const lessonRef = doc(db, 'sundaySchoolLessons', lessonId);
    await deleteDoc(lessonRef);
}
