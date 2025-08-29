
"use client";

import { useState } from "react";
import { format, isValid } from "date-fns";
import {
  Archive,
  Edit,
  MoreVertical,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import type { Information } from "@/lib/types";
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

const initialInformation: Information[] = [
  {
    id: "1",
    title: "Annual Summer Picnic",
    content:
      "Join us for our annual summer picnic on August 15th at Central Park. Fun, food, and fellowship for the whole family! We'll have games for the kids and a BBQ for everyone. Please sign up in the lobby so we can get a headcount.",
    date: "2024-07-20",
    status: "published",
  },
  {
    id: "2",
    title: "Guest Speaker This Sunday",
    content:
      "We are excited to have Pastor John from our sister church joining us this Sunday to deliver a special message. You won't want to miss it!",
    date: "2024-07-18",
    status: "published",
  },
  {
    id: "3",
    title: "Youth Group Car Wash Fundraiser",
    content:
      "The youth group will be holding a car wash fundraiser next Saturday to raise money for their upcoming mission trip. Please come out and support them!",
    date: "2024-06-15",
    status: "archived",
  },
];

const emptyInformation: Omit<Information, "id"> = {
  title: "",
  content: "",
  date: new Date().toISOString().split("T")[0],
  status: "published",
};

export default function InformationPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [information, setInformation] = useState(initialInformation);
  const [selectedItem, setSelectedItem] = useState<Information | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");

  const handleCreateClick = () => {
    setSelectedItem(emptyInformation as Information);
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: Information) => {
    setSelectedItem({ ...item });
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedItem) return;

    if (!selectedItem.title || !selectedItem.content) {
      toast({
        title: "Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }

    if (dialogMode === "create") {
      setInformation([
        { ...selectedItem, id: (information.length + 1).toString() },
        ...information,
      ]);
      toast({
        title: "Success",
        description: "New information has been published.",
      });
    } else {
      setInformation(
        information.map((item) =>
          item.id === selectedItem.id ? selectedItem : item
        )
      );
      toast({
        title: "Success",
        description: "Information has been updated.",
      });
    }

    setIsDialogOpen(false);
    setSelectedItem(null);
  };

  const handleFieldChange = (
    field: keyof Omit<Information, "id">,
    value: string
  ) => {
    if (selectedItem) {
      setSelectedItem((prev) => (prev ? { ...prev, [field]: value } : null));
    }
  };

  const handleDelete = (id: string) => {
    setInformation(information.filter((item) => item.id !== id));
    toast({
      title: "Deleted",
      description: "The information item has been removed.",
    });
  };

  const handleArchive = (id: string) => {
    setInformation(
      information.map((item) =>
        item.id === id ? { ...item, status: "archived" } : item
      )
    );
    toast({
      title: "Archived",
      description: "The information item has been archived.",
    });
  };

  const getStatusVariant = (status: Information["status"]) => {
    switch (status) {
      case "published":
        return "default";
      case "archived":
        return "secondary";
      default:
        return "outline";
    }
  };

  const AdminView = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Information
          </h1>
          <p className="text-muted-foreground">
            Create and manage announcements for your members.
          </p>
        </div>
        <Button onClick={handleCreateClick} className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Information
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Information Log</CardTitle>
          <CardDescription>
            A list of all published and archived announcements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {information.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    {isValid(new Date(item.date))
                      ? format(new Date(item.date), "PPP")
                      : "Invalid Date"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditClick(item)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        {item.status === "published" && (
                          <DropdownMenuItem
                            onClick={() => handleArchive(item.id)}
                          >
                            <Archive className="mr-2 h-4 w-4" /> Archive
                          </DropdownMenuItem>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the information item.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item.id)}
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create"
                ? "Create New Information"
                : "Edit Information"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Fill in the details for the new announcement."
                : `Update the details for "${selectedItem?.title}".`}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={selectedItem.title}
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
                  value={selectedItem.date}
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
                  value={selectedItem.content}
                  onChange={(e) =>
                    handleFieldChange("content", e.target.value)
                  }
                  className="col-span-3 min-h-[200px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
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
        <h1 className="text-3xl font-bold tracking-tight">Information</h1>
        <p className="text-muted-foreground">
          Latest news and announcements from the church.
        </p>
      </div>
      <div className="space-y-6">
        {information
          .filter((item) => item.status === "published")
          .map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>
                  {isValid(new Date(item.date))
                    ? format(new Date(item.date), "MMMM d, yyyy")
                    : "No Date"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.content}</p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );

  return user?.role === "admin" || user?.role === "superuser" ? (
    <AdminView />
  ) : (
    <MemberView />
  );
}
