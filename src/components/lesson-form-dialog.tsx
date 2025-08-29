"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import type { SundaySchoolLesson } from "@/lib/types";
import { addLesson, updateLesson } from "@/actions/sunday-school-actions";

const emptyLesson: Omit<SundaySchoolLesson, "id" | "createdAt"> = {
  title: "",
  description: "",
  content: "",
  date: new Date().toISOString().split('T')[0],
};

interface LessonFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  lesson: SundaySchoolLesson | null;
  onSave: () => void;
}

export function LessonFormDialog({ isOpen, onOpenChange, lesson, onSave }: LessonFormDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(emptyLesson);

  useEffect(() => {
    if (isOpen) {
      // When the dialog opens, initialize the form data
      // If we are editing a lesson, use its data, otherwise use the empty lesson object
      setFormData(lesson ? { ...lesson } : emptyLesson);
    }
  }, [isOpen, lesson]);


  const handleFieldChange = (field: keyof Omit<SundaySchoolLesson, 'id' | 'createdAt'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({ title: "Error", description: "Title and content are required.", variant: "destructive" });
      return;
    }
    
    try {
      if (lesson) { // We are editing an existing lesson
        const lessonToUpdate = { ...formData, id: lesson.id };
        await updateLesson(lessonToUpdate);
        toast({ title: "Lesson Updated", description: "The lesson has been updated." });
      } else { // We are creating a new lesson
        await addLesson(formData);
        toast({ title: "Lesson Added", description: "A new lesson has been created." });
      }
      onSave(); // This will trigger a refetch on the parent page
    } catch (error) {
       console.error("Failed to save lesson:", error);
       toast({ title: "Error", description: "Could not save the lesson.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{lesson ? 'Edit Lesson' : 'Create New Lesson'}</DialogTitle>
          <DialogDescription>
            {lesson ? `Update the details for the "${lesson.title}" lesson.` : 'Fill in the details for the new lesson.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lesson-title" className="text-right">
              Title
            </Label>
            <Input
              id="lesson-title"
              value={formData.title}
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
              value={formData.description}
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
              value={formData.date}
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
              value={formData.content}
              onChange={(e) => handleFieldChange("content", e.target.value)}
              className="col-span-3 min-h-[200px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false) }>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
