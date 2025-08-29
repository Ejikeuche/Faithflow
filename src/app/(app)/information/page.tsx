
"use client";

import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  getInformation,
  addInformation,
  updateInformation,
  deleteInformation,
  archiveInformation,
} from "@/actions/information-actions";


const emptyInformation: Omit<Information, "id" | "createdAt"> = {
  title: "",
  content: "",
  date: new Date().toISOString().split("T")[0],
  status: "published",
};

export default function InformationPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [information, setInformation] = useState<Information[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Omit<Information, "createdAt"> | Omit<Information, "id" | "createdAt"> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");

  const fetchInformation = async () => {
    setIsLoading(true);
    try {
      const fetchedInformation = await getInformation();
      setInformation(fetchedInformation);
    } catch (error) {
      console.error("Failed to fetch information:", error);
      toast({ title: "Error", description: "Could not fetch information.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInformation();
  }, [toast]);


  const handleCreateClick = () => {
    setSelectedItem(emptyInformation);
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: Information) => {
    setSelectedItem({ ...item });
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    if (!selectedItem.title || !selectedItem.content) {
      toast({
        title: "Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (dialogMode === "create") {
        await addInformation(selectedItem as Omit<Information, "id" | "createdAt">);
        toast({
          title: "Success",
          description: "New information has been published.",
        });
      } else {
        await updateInformation(selectedItem as Omit<Information, "createdAt">);
        toast({
          title: "Success",
          description: "Information has been updated.",
        });
      }
      await fetchInformation();
      setIsDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to save information:", error);
      toast({ title: "Error", description: "Could not save information.", variant: "destructive" });
    }
  };

  const handleFieldChange = (
    field: keyof Omit<Information, "id" | "createdAt">,
    value: string
  ) => {
    if (selectedItem) {
      setSelectedItem((prev) => (prev ? { ...prev, [field]: value } : null));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInformation(id);
      await fetchInformation();
      toast({
        title: "Deleted",
        description: "The information item has been removed.",
      });
    } catch(error) {
       toast({ title: "Error", description: "Could not delete item.", variant: "destructive" });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveInformation(id);
      await fetchInformation();
      toast({
        title: "Archived",
        description: "The information item has been archived.",
      });
    } catch(error) {
       toast({ title: "Error", description: "Could not archive item.", variant: "destructive" });
    }
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

  const parseDate = (dateString: string) => {
    const date = new Date(dateString);
    if (dateString && !dateString.includes('T')) {
      date.setUTCHours(0, 0, 0, 0);
    }
    return date;
  }

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
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
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
                {information.map((item) => {
                  const date = parseDate(item.date);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        {isValid(date)
                          ? format(date, "PPP")
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
                  );
                })}
              </TableBody>
            </Table>
          )}
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
                  value={(selectedItem as Omit<Information, 'id' | 'createdAt'>).title}
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
                  value={(selectedItem as Omit<Information, 'id' | 'createdAt'>).date}
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
                  value={(selectedItem as Omit<Information, 'id' | 'createdAt'>).content}
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
      {isLoading ? (
         <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
         </div>
      ) : (
        <div className="space-y-6">
          {information
            .filter((item) => item.status === "published")
            .map((item) => {
              const date = parseDate(item.date);
              return (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>
                      {isValid(date)
                        ? format(date, "MMMM d, yyyy")
                        : "No Date"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.content}</p>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );

  return user?.role === "admin" || user?.role === "superuser" ? (
    <AdminView />
  ) : (
    <MemberView />
  );
}
