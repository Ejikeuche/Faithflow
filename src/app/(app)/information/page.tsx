
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  deleteInformation,
  archiveInformation,
} from "@/actions/information-actions";
import { InformationFormDialog } from "@/components/information-form-dialog";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const toInformationObject = (doc: any): Information => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data
    } as Information;
};


export default function InformationPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [information, setInformation] = useState<Information[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Information | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchInformation = async () => {
    setIsLoading(true);
    try {
      const infoCollection = collection(db, 'information');
      const q = query(infoCollection, orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const fetchedInformation = snapshot.docs.map(toInformationObject);
      setInformation(fetchedInformation);
    } catch (error) {
      console.error("Failed to fetch information:", error);
      toast({ title: "Error", description: "Could not fetch information.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(user) {
        fetchInformation();
    }
  }, [user, toast]);


  const handleCreateClick = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: Information) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDialogSave = () => {
    fetchInformation(); // Refetch after saving
    setIsDialogOpen(false);
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
    if(!dateString) return new Date();
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

      <InformationFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={editingItem}
        onSave={handleDialogSave}
      />
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
