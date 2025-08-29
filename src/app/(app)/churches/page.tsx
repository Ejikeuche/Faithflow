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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Church } from "@/lib/types";
import { getChurches, addChurch, updateChurch } from "@/actions/church-actions";
import { Skeleton } from "@/components/ui/skeleton";

const emptyChurch: Omit<Church, 'id'> = {
  name: "",
  location: "",
  members: 0,
  status: "Active",
  pastor: "",
  email: "",
  phone: "",
  website: ""
};

export default function ChurchesPage() {
  const { toast } = useToast();
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<Partial<Church> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChurches = async () => {
      setIsLoading(true);
      const fetchedChurches = await getChurches();
      setChurches(fetchedChurches);
      setIsLoading(false);
    };
    fetchChurches();
  }, []);

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
      if (selectedChurch.id) {
        // Editing existing church
        const updatedChurch = await updateChurch(selectedChurch as Church);
        setChurches(churches.map(c => c.id === updatedChurch.id ? updatedChurch : c));
        toast({ title: "Church Updated", description: `${updatedChurch.name} has been updated.` });
      } else {
        // Adding new church
        const newChurch = await addChurch(selectedChurch as Omit<Church, 'id'>);
        setChurches([...churches, newChurch]);
        toast({ title: "Church Added", description: `${newChurch.name} has been added.` });
      }
      setIsDialogOpen(false);
      setSelectedChurch(null);
    } catch (error) {
       toast({ title: "Error", description: "Could not save church. Please try again.", variant: "destructive" });
       console.error("Failed to save church:", error);
    }
  };

  const handleFieldChange = (field: keyof Omit<Church, 'id' | 'members' | 'status'>, value: string) => {
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
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditClick(church)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewDetails(church)}>View Details</DropdownMenuItem>
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
                  <DialogTitle>{selectedChurch?.id ? 'Edit Church' : 'Add New Church'}</DialogTitle>
                  <DialogDescription>
                      {selectedChurch?.id ? 'Update the details for this church.' : 'Fill in the details for the new church.'} Click save when you're done.
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
