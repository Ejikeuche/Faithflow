
"use client";

import { useState } from "react";
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
import { PlusCircle } from "lucide-react";
import type { SundaySchoolLesson } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format, isValid } from "date-fns";

const initialLessons: SundaySchoolLesson[] = [
  {
    id: "1",
    title: "The Story of Creation",
    description: "Genesis 1-2. A look at the beginning of the world.",
    content: "In the beginning, God created the heavens and the earth... The lesson will explore the seven days of creation and the significance of God's work. We will discuss the concepts of creation ex nihilo (out of nothing) and the role of humanity as stewards of creation.",
    date: "2024-07-21"
  },
  {
    id: "2",
    title: "The Faith of Abraham",
    description: "Genesis 12, 15, 22. Understanding faith and promises.",
    content: "This lesson follows the journey of Abraham, from his call to leave his home to the ultimate test of his faith. We will examine the covenant God made with Abraham and how his story is a cornerstone of faith for millions.",
    date: "2024-07-28"
  },
  {
    id: "3",
    title: "The Sermon on the Mount",
    description: "Matthew 5-7. The core teachings of Jesus.",
    content: "An in-depth study of one of the most famous sermons ever given. We will break down the Beatitudes, the Lord's Prayer, and Jesus' teachings on anger, lust, prayer, and judging others. The focus will be on practical application in daily life.",
    date: "2024-08-04"
  },
];

export default function SundaySchoolPage() {
  const { user } = useUser();
  const [lessons, setLessons] = useState<SundaySchoolLesson[]>(initialLessons);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<SundaySchoolLesson | null>(null);

  const handleEditClick = (lesson: SundaySchoolLesson) => {
    setSelectedLesson({ ...lesson });
    setIsEditing(true);
  };

  const handleCreateClick = () => {
    setSelectedLesson({ id: ``, title: "", description: "", content: "", date: new Date().toISOString().split('T')[0] });
    setIsCreating(true);
  }

  const handleSave = () => {
    if (selectedLesson) {
        if(isCreating) {
            setLessons([...lessons, {...selectedLesson, id: (lessons.length + 1).toString()}]);
        } else {
             setLessons(
                lessons.map((l) => (l.id === selectedLesson.id ? selectedLesson : l))
             );
        }
    }
    setIsEditing(false);
    setIsCreating(false);
    setSelectedLesson(null);
  };

  const handleFieldChange = (field: keyof SundaySchoolLesson, value: any) => {
    if (selectedLesson) {
      setSelectedLesson({ ...selectedLesson, [field]: value });
    }
  };

  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
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
              <CardFooter>
                <Button className="w-full" onClick={() => handleEditClick(lesson)}>Edit Lesson</Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={isEditing || isCreating} onOpenChange={isCreating ? setIsCreating : setIsEditing}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create New Lesson' : 'Edit Lesson'}</DialogTitle>
            <DialogDescription>
              {isCreating ? 'Fill in the details for the new lesson.' : `Update the details for the ${selectedLesson?.title} lesson.`}
            </DialogDescription>
          </DialogHeader>
          {selectedLesson && (
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
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditing(false); setIsCreating(false); }}>
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
            </CardContent>
        </Card>
    </div>
  );
  
  return user?.role === "admin" || user?.role === "superuser" ? <AdminView /> : <MemberView />;
}
