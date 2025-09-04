
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Church } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const emptyChurch: Omit<Church, 'id' | 'createdAt'> = {
  name: "",
  location: "",
  members: 0,
  status: "Active",
  pastor: "",
  email: "",
  phone: "",
  website: ""
};

const toChurchObject = (doc: any): Church => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data
    } as Church;
};

export default function ChurchesPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<Omit<Church, 'createdAt'> | Omit<Church, 'id' | 'createdAt'> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChurches = async () => {
    setIsLoading(true);
    try {
      const churchesCollection = collection(db, 'churches');
      const q = query(churchesCollection, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const fetchedChurches = snapshot.docs.map(toChurchObject);
      setChurches(fetchedChurches);
    } catch (error) {
      console.error("Failed to fetch churches:", error);
      toast({ title: "Error", description: "Could not fetch churches.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(user) {
        fetchChurches();
    }
  }, [user, toast]);

  const handleAddClick = () => {
    setSelectedChurch(emptyChurch);
    setIsDialogOpen(true);
  };

  const handleEditClick = (church: Church) => {
    setSelectedChurch(church);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedChurch?.name) {
        toast({ title: "Error", description: "Church name is required.", variant: "destructive" });
        return;
    }

    try {
      if ('id' in selectedChurch && selectedChurch.id) {
        // Editing existing church
        const churchRef = doc(db, "churches", selectedChurch.id);
        const { id, ...dataToUpdate } = selectedChurch;
        await updateDoc(churchRef, {
            ...dataToUpdate,
            updatedAt: serverTimestamp()
        });
        toast({ title: "Church Updated", description: `${selectedChurch.name} has been updated.` });
      } else {
        // Adding new church
         await addDoc(collection(db, "churches"), {
            ...(selectedChurch as Omit<Church, 'id' | 'createdAt'>),
            createdAt: serverTimestamp()
        });
        toast({ title: "Church Added", description: `${selectedChurch.name} has been added.` });
      }
      fetchChurches();
      setIsDialogOpen(false);
      setSelectedChurch(null);
    } catch (error) {
       toast({ title: "Error", description: "Could not save church. Please try again.", variant: "destructive" });
       console.error("Failed to save church:", error);
    }
  };

  const handleFieldChange = (field: keyof Omit<Church, 'id' | 'createdAt' | 'members' | 'status'>, value: string) => {
    if (selectedChurch) {
        setSelectedChurch(prev => prev ? { ...prev, [field]: value } : null);
    }
  };
  
  const handleViewDetails = (church: Church) => {
      toast({
          title: `Details for ${church.name}`,
          description: `Location: ${church.location}, Members: ${church.members.toLocaleString()}`
      })
  }

  const handleStatusChange = async (church: Church) => {
    const newStatus = church.status === "Active" ? "Inactive" : "Active";
    try {
      const churchRef = doc(db, "churches", church.id);
      await updateDoc(churchRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Status Updated", description: `${church.name} is now ${newStatus}.` });
      fetchChurches();
    } catch (error) {
      toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (churchId: string) => {
    try {
      await deleteDoc(doc(db, "churches", churchId));
      toast({ title: "Church Deleted", description: "The church has been successfully deleted." });
      fetchChurches();
    } catch (error) {
      toast({ title: "Error", description: "Could not delete church.", variant: "destructive" });
      console.error("Failed to delete church:", error);
    }
  };

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Church Management</h1>
        <p className="text-muted-foreground">Add, edit, and manage all churches in the network.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Churches</CardTitle>
                <CardDescription>A list of all registered churches.</CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={handleAddClick}>
                <PlusCircle className="h-4 w-4" />
                Add Church
            </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {churches.map((church) => (
                  <TableRow key={church.id}>
                    <TableCell className="font-medium">{church.name}</TableCell>
                    <TableCell>{church.location}</TableCell>
                    <TableCell>{church.members.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={church.status === 'Active' ? 'default' : 'secondary'}>{church.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditClick(church)}>Edit Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(church)}>
                            Set as {church.status === 'Active' ? 'Inactive' : 'Active'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                 <Trash2 className="mr-2 h-4 w-4" /> Delete Church
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the church and all its associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(church.id)}>Continue</AlertDialogAction>
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
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>{selectedChurch && 'id' in selectedChurch ? 'Edit Church' : 'Add New Church'}</DialogTitle>
                  <DialogDescription>
                      {selectedChurch && 'id' in selectedChurch ? 'Update the details for this church.' : 'Fill in the details for the new church.'} Click save when you're done.
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input id="name" value={selectedChurch?.name || ''} onChange={e => handleFieldChange('name', e.target.value)} placeholder="Sanctuary of Grace" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location" className="text-right">Location</Label>
                      <Input id="location" value={selectedChurch?.location || ''} onChange={e => handleFieldChange('location', e.target.value)} placeholder="New York, NY" className="col-span-3" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="members" className="text-right">Members</Label>
                      <Input id="members" type="number" value={selectedChurch?.members || 0} onChange={e => setSelectedChurch(prev => prev ? { ...prev, members: Number(e.target.value) } : null)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="pastor" className="text-right">Pastor</Label>
                      <Input id="pastor" value={selectedChurch?.pastor || ''} onChange={e => handleFieldChange('pastor', e.target.value)} placeholder="Rev. Dr. Martin Luther King Jr." className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input id="email" type="email" value={selectedChurch?.email || ''} onChange={e => handleFieldChange('email', e.target.value)} placeholder="pastor@example.com" className="col-span-3" />
                  </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Phone</Label>
                      <Input id="phone" type="tel" value={selectedChurch?.phone || ''} onChange={e => handleFieldChange('phone', e.target.value)} placeholder="(123) 456-7890" className="col-span-3" />
                  </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="website" className="text-right">Website</Label>
                      <Input id="website" type="url" value={selectedChurch?.website || ''} onChange={e => handleFieldChange('website', e.target.value)} placeholder="https://example.com" className="col-span-3" />
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" onClick={handleSave}>Save Church</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}

    