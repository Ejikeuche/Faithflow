
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { getLessons, addLesson, updateLesson, deleteLesson } from "@/actions/sunday-school-actions";
import { Skeleton } from "@/components/ui/skeleton";

const emptyLesson: Omit<SundaySchoolLesson, "id" | "createdAt"> = {
  title: "",
  description: "",
  content: "",
  date: new Date().toISOString().split('T')[0],
};

type EditableLesson = Omit<SundaySchoolLesson, 'createdAt'> | Omit<SundaySchoolLesson, 'id' | 'createdAt'>;

export default function SundaySchoolPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<SundaySchoolLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<EditableLesson>(emptyLesson);

  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true);
      try {
        const fetchedLessons = await getLessons();
        setLessons(fetchedLessons);
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
        toast({ title: "Error", description: "Could not fetch lessons.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLessons();
  }, [toast]);

  const handleCreateClick = () => {
    setSelectedLesson(emptyLesson);
    setIsDialogOpen(true);
  };

  const handleEditClick = (lesson: SundaySchoolLesson) => {
    const { createdAt, ...editableLesson } = lesson;
    setSelectedLesson(editableLesson);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (lessonId: string) => {
     try {
      await deleteLesson(lessonId);
      setLessons(lessons.filter((l) => l.id !== lessonId));
      toast({ title: "Lesson Deleted", description: "The lesson has been removed." });
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      toast({ title: "Error", description: "Could not delete the lesson.", variant: "destructive" });
    }
  }

  const handleSave = async () => {
    if (!selectedLesson.title || !selectedLesson.content) {
      toast({ title: "Error", description: "Title and content are required.", variant: "destructive" });
      return;
    }
    
    try {
      if ('id' in selectedLesson && selectedLesson.id) {
        const updatedLesson = await updateLesson(selectedLesson as Omit<SundaySchoolLesson, 'createdAt'>);
        setLessons(lessons.map((l) => (l.id === updatedLesson.id ? updatedLesson : l)));
        toast({ title: "Lesson Updated", description: "The lesson has been updated." });
      } else {
        const newLesson = await addLesson(selectedLesson as Omit<SundaySchoolLesson, 'id' | 'createdAt'>);
        setLessons([newLesson, ...lessons]);
        toast({ title: "Lesson Added", description: "A new lesson has been created." });
      }
      setIsDialogOpen(false);
    } catch (error) {
       console.error("Failed to save lesson:", error);
       toast({ title: "Error", description: "Could not save the lesson.", variant: "destructive" });
    }
  };

  const handleFieldChange = (field: keyof Omit<SundaySchoolLesson, 'id' | 'createdAt'>, value: string) => {
    setSelectedLesson(prev => ({ ...prev, [field]: value }));
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedLesson(emptyLesson);
    }
  }

  const parseDate = (dateString: string) => {
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

      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{'id' in selectedLesson ? 'Edit Lesson' : 'Create New Lesson'}</DialogTitle>
            <DialogDescription>
              {'id' in selectedLesson ? `Update the details for the ${selectedLesson?.title} lesson.` : 'Fill in the details for the new lesson.'}
            </DialogDescription>
          </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lesson-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="lesson-title"
                  value={selectedLesson.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lesson-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="lesson-description"
                  value={selectedLesson.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  className="col-span-3"
                />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lesson-date" className="text-right">
                  Date
                </Label>
                <Input
                  id="lesson-date"
                  type="date"
                  value={selectedLesson.date}
                  onChange={(e) => handleFieldChange("date", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="lesson-content" className="text-right pt-2">
                  Content
                </Label>
                <Textarea
                  id="lesson-content"
                  value={selectedLesson.content}
                  onChange={(e) => handleFieldChange("content", e.target.value)}
                  className="col-span-3 min-h-[200px]"
                />
              </div>
            </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false) }>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                                      <p className="pt-2 text-xs text-muted-foreground">{isValid(date) ? format(date, "MMMM d, yyyy") : 'No date'}</p>
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

    