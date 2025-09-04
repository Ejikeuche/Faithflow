
"use client";

import { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { format, isValid } from "date-fns";
import type { Member } from "@/lib/types";
import { addMember, updateMember, deleteMember } from "@/actions/member-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const emptyMember: Omit<Member, 'id' | 'createdAt'> = {
    name: "",
    email: "",
    role: "Member",
    joined: new Date().toISOString().split("T")[0],
    phone: "",
    address: ""
};

const toMemberObject = (doc: any): Member => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data
    } as Member;
};

export default function MembersPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMember, setSelectedMember] = useState<Omit<Member, 'createdAt'> | Omit<Member, 'id' | 'createdAt'> | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const membersCollection = collection(db, 'members');
        const q = query(membersCollection, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedMembers = snapshot.docs.map(toMemberObject);
        setMembers(fetchedMembers);
      } catch (error) {
        console.error("Failed to fetch members:", error);
        toast({ title: "Error", description: "Could not fetch members.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      if (user) {
        fetchMembers();
      }
    }, [user, toast]);


    const handleAddClick = () => {
        setSelectedMember(emptyMember);
        setIsDialogOpen(true);
    };

    const handleEditClick = (member: Member) => {
        setSelectedMember(member);
        setIsDialogOpen(true);
    };
    
    const handleDelete = async (memberId: string) => {
        try {
            await deleteMember(memberId);
            setMembers(members.filter(m => m.id !== memberId));
            toast({ title: "Member Deleted", description: "The member has been removed from the list." });
        } catch(error) {
            console.error("Failed to delete member:", error);
            toast({ title: "Error", description: "Could not delete member. Please try again.", variant: "destructive" });
        }
    };

    const handleSave = async () => {
        if (!selectedMember?.name || !selectedMember?.email) {
            toast({ title: "Error", description: "Name and email are required.", variant: "destructive" });
            return;
        }

        try {
            if ('id' in selectedMember && selectedMember.id) {
                // Editing existing member
                const updated = await updateMember(selectedMember as Omit<Member, 'createdAt'>);
                await fetchMembers(); // Refetch
                toast({ title: "Member Updated", description: `${updated.name}'s details have been updated.` });
            } else {
                // Adding new member
                const newMember = await addMember(selectedMember as Omit<Member, 'id' | 'createdAt'>);
                await fetchMembers(); // Refetch
                toast({ title: "Member Added", description: `${newMember.name} has been added.` });
            }
            setIsDialogOpen(false);
            setSelectedMember(null);
        } catch (error) {
            toast({ title: "Error", description: "Could not save member. Please try again.", variant: "destructive" });
            console.error("Failed to save member:", error);
        }
    };

    const handleFieldChange = (field: keyof Omit<Member, 'id' | 'createdAt' | 'joined'>, value: string) => {
      if (selectedMember) {
        setSelectedMember(prev => {
          if (!prev) return null;
          // Create a new object to ensure re-render
          const newDetails = { ...prev };
          (newDetails as any)[field] = value;
          return newDetails;
        });
      }
    };
    
    const handleJoinedDateChange = (value: string) => {
       if (selectedMember) {
            setSelectedMember(prev => prev ? { ...prev, joined: value } : null);
        }
    }
    
    const parseDate = (dateString: string) => {
        if (!dateString) return new Date();
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts.map(Number);
            return new Date(year, month - 1, day);
        }
        return new Date(dateString);
    }
    
    const handleViewProfile = (member: Member) => {
        const joinedDate = parseDate(member.joined);
        toast({
            title: `Profile: ${member.name}`,
            description: `Email: ${member.email}, Role: ${member.role}, Joined: ${isValid(joinedDate) ? format(joinedDate, "PPP") : 'Invalid Date'}`
        });
    };

  return (
     <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Member Management</h1>
        <p className="text-muted-foreground">Add, edit, and manage all community members.</p>
      </div>
      <Card>
         <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Members</CardTitle>
                <CardDescription>A list of all members in the church.</CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={handleAddClick}>
                <PlusCircle className="h-4 w-4" />
                Add Member
            </Button>
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
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Joined Date</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const joinedDate = parseDate(member.joined);
                  return(
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                           <Avatar>
                              <AvatarImage src={`https://avatar.vercel.sh/${member.email}.png`} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{member.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{member.email}</TableCell>
                    <TableCell>
                      <Badge variant={member.role === "Admin" ? "destructive" : "secondary"}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {isValid(joinedDate) ? format(joinedDate, "PPP") : 'Invalid Date'}
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
                          <DropdownMenuItem onClick={() => handleEditClick(member)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewProfile(member)}>View Profile</DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the member's account
                                  and remove their data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(member.id)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>{selectedMember && 'id' in selectedMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                  <DialogDescription>{selectedMember && 'id' in selectedMember ? 'Update member details.' : 'Fill in the details for the new member.'}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input id="name" value={selectedMember?.name || ''} onChange={e => handleFieldChange('name', e.target.value)} placeholder="Peter Jones" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input id="email" type="email" value={selectedMember?.email || ''} onChange={e => handleFieldChange('email', e.target.value)} placeholder="peter.j@example.com" className="col-span-3" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="joined" className="text-right">Joined</Label>
                      <Input id="joined" type="date" value={selectedMember?.joined || ''} onChange={e => handleJoinedDateChange(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Phone</Label>
                      <Input id="phone" type="tel" value={selectedMember?.phone || ''} onChange={e => handleFieldChange('phone', e.target.value)} placeholder="(123) 456-7890" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="text-right">Address</Label>
                      <Input id="address" value={selectedMember?.address || ''} onChange={e => handleFieldChange('address', e.target.value)} placeholder="123 Main St, Anytown, USA" className="col-span-3" />
                  </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">Role</Label>
                      <Select value={selectedMember?.role} onValueChange={(value: "Admin" | "Member") => handleFieldChange('role', value)}>
                          <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Member">Member</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" onClick={handleSave}>Save Member</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
