
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
import type { Information } from "@/lib/types";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";

const emptyInformation: Omit<Information, "id" | "createdAt"> = {
  title: "",
  content: "",
  date: new Date().toISOString().split("T")[0],
  status: "published",
};

interface InformationFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: Information | null;
  onSave: () => void;
}

export function InformationFormDialog({ isOpen, onOpenChange, item, onSave }: InformationFormDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(emptyInformation);

  useEffect(() => {
    if (isOpen) {
      setFormData(item ? { ...item } : emptyInformation);
    }
  }, [isOpen, item]);

  const handleFieldChange = (field: keyof Omit<Information, "id" | "createdAt">, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (item) { // Editing existing item
        const itemRef = doc(db, "information", item.id);
        const { id, ...dataToUpdate } = formData;
        await updateDoc(itemRef, {
            ...dataToUpdate,
            updatedAt: serverTimestamp()
        });

        toast({
          title: "Success",
          description: "Information has been updated.",
        });
      } else { // Creating new item
        await addDoc(collection(db, "information"), {
            ...formData,
            createdAt: serverTimestamp()
        });
        toast({
          title: "Success",
          description: "New information has been published.",
        });
      }
      onSave(); // This will trigger a refetch on the parent page
    } catch (error) {
      console.error("Failed to save information:", error);
      toast({ title: "Error", description: "Could not save information.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit Information" : "Create New Information"}
          </DialogTitle>
          <DialogDescription>
            {item
              ? `Update the details for "${item.title}".`
              : "Fill in the details for the new announcement."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleFieldChange("date", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">
              Content
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleFieldChange("content", e.target.value)}
              className="col-span-3 min-h-[200px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
