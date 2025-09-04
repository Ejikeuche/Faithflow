
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { PlusCircle, Trash2 } from "lucide-react";
import type { SundaySchoolLesson } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format, isValid } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonFormDialog } from "@/components/lesson-form-dialog";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, doc, deleteDoc } from "firebase/firestore";


const toLessonObject = (doc: any): SundaySchoolLesson => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data
    } as SundaySchoolLesson;
};


export default function SundaySchoolPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<SundaySchoolLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<SundaySchoolLesson | null>(null);

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      const lessonsCollection = collection(db, 'sundaySchoolLessons');
      const q = query(lessonsCollection, orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const fetchedLessons = snapshot.docs.map(toLessonObject);
      setLessons(fetchedLessons);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
      toast({ title: "Error", description: "Could not fetch lessons.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(user) {
        fetchLessons();
    }
  }, [user, toast]);

  const handleCreateClick = () => {
    setEditingLesson(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (lesson: SundaySchoolLesson) => {
    setEditingLesson(lesson);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (lessonId: string) => {
     try {
      await deleteDoc(doc(db, "sundaySchoolLessons", lessonId));
      await fetchLessons(); // Refetch to update list
      toast({ title: "Lesson Deleted", description: "The lesson has been removed." });
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      toast({ title: "Error", description: "Could not delete the lesson.", variant: "destructive" });
    }
  }
  
  const handleDialogSave = () => {
    fetchLessons(); // Refetch lessons after a save operation
    setIsDialogOpen(false);
  }

  const parseDate = (dateString: string) => {
    if(!dateString) return new Date();
    const date = new Date(dateString);
    if (dateString && !dateString.includes('T')) {
      date.setUTCHours(0, 0, 0, 0);
    }
    return date;
  };
  
  const AdminView = () => (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Sunday School</h1>
                <p className="text-muted-foreground">
                Create, edit, and organize lessons for the community.
                </p>
            </div>
            <Button onClick={handleCreateClick} className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Add Lesson
            </Button>
        </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => {
            const date = parseDate(lesson.date);
            return (
              <Card key={lesson.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{lesson.title}</CardTitle>
                  <CardDescription>{lesson.description}</CardDescription>
                  <CardDescription className="pt-2 text-xs text-muted-foreground">
                    {isValid(date) ? format(date, "MMMM d, yyyy") : 'No date'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{lesson.content}</p>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Button className="w-full" onClick={() => handleEditClick(lesson)}>Edit Lesson</Button>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this lesson.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(lesson.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      <LessonFormDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        lesson={editingLesson}
        onSave={handleDialogSave}
      />
      
    </div>
  );

  const MemberView = () => (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Sunday School</h1>
            <p className="text-muted-foreground">
            Explore this week's lessons and materials.
            </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Current Lessons</CardTitle>
                <CardDescription>Click on a lesson to expand and read the material.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                      {lessons.map(lesson => {
                        const date = parseDate(lesson.date);
                        return (
                          <AccordionItem value={lesson.id} key={lesson.id}>
                              <AccordionTrigger>
                                  <div className="text-left">
                                      <h3 className="font-semibold">{lesson.title}</h3>
                                      <p className="text-sm text-muted-foreground">{lesson.description}</p>
                                      <p className="pt-2 text-xs text-muted-foreground">{isValid(date) ? format(date, "MMMM d, yyy4") : 'No date'}</p>
                                  </div>
                              </AccordionTrigger>
                              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                                  {lesson.content}
                              </AccordionContent>
                          </AccordionItem>
                      )})}
                  </Accordion>
                )}
            </CardContent>
        </Card>
    </div>
  );
  
  return user?.role === "admin" || user?.role === "superuser" ? <AdminView /> : <MemberView />;
}
