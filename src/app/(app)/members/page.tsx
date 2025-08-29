"use client";

import { useState } from "react";
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


type Member = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Member";
  joined: string;
  phone?: string;
  address?: string;
};

const initialMembers: Member[] = [
    { id: "1", name: "John Doe", email: "john.d@example.com", role: "Admin", joined: "2023-01-15" },
    { id: "2", name: "Jane Smith", email: "jane.s@example.com", role: "Member", joined: "2023-02-20" },
    { id: "3", name: "Sam Wilson", email: "sam.w@example.com", role: "Member", joined: "2022-11-10" },
    { id: "4", name: "Emily Brown", email: "emily.b@example.com", role: "Member", joined: "2023-05-01" },
    { id: "5", name: "Michael Johnson", email: "michael.j@example.com", role: "Member", joined: "2021-08-23" },
];

const emptyMember: Member = {
    id: "",
    name: "",
    email: "",
    role: "Member",
    joined: new Date().toISOString().split("T")[0],
    phone: "",
    address: ""
};

export default function MembersPage() {
    const { toast } = useToast();
    const [members, setMembers] = useState(initialMembers);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddClick = () => {
        setSelectedMember(emptyMember);
        setIsDialogOpen(true);
    };

    const handleEditClick = (member: Member) => {
        setSelectedMember(member);
        setIsDialogOpen(true);
    };
    
    const handleDelete = (memberId: string) => {
        setMembers(members.filter(m => m.id !== memberId));
        toast({ title: "Member Deleted", description: "The member has been removed from the list." });
    };

    const handleSave = () => {
        if (!selectedMember?.name || !selectedMember?.email) {
            toast({ title: "Error", description: "Name and email are required.", variant: "destructive" });
            return;
        }

        if (selectedMember.id) {
            setMembers(members.map(m => m.id === selectedMember.id ? selectedMember : m));
            toast({ title: "Member Updated", description: `${selectedMember.name}'s details have been updated.` });
        } else {
            const newMember = { ...selectedMember, id: (members.length + 1).toString() };
            setMembers([...members, newMember]);
            toast({ title: "Member Added", description: `${newMember.name} has been added.` });
        }
        setIsDialogOpen(false);
        setSelectedMember(null);
    };

    const handleFieldChange = (field: keyof Omit<Member, 'id' | 'joined'>, value: string) => {
        if (selectedMember) {
            setSelectedMember(prev => prev ? { ...prev, [field]: value } : null);
        }
    };
    
    const handleViewProfile = (member: Member) => {
        toast({
            title: `Profile: ${member.name}`,
            description: `Email: ${member.email}, Role: ${member.role}, Joined: ${member.joined}`
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
              {members.map((member) => (
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
                  <TableCell className="hidden md:table-cell">{member.joined}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>{selectedMember?.id ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                  <DialogDescription>{selectedMember?.id ? 'Update member details.' : 'Fill in the details for the new member.'}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input id="name" value={selectedMember?.name} onChange={e => handleFieldChange('name', e.target.value)} placeholder="Peter Jones" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input id="email" type="email" value={selectedMember?.email} onChange={e => handleFieldChange('email', e.target.value)} placeholder="peter.j@example.com" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Phone</Label>
                      <Input id="phone" type="tel" value={selectedMember?.phone} onChange={e => handleFieldChange('phone', e.target.value)} placeholder="(123) 456-7890" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="text-right">Address</Label>
                      <Input id="address" value={selectedMember?.address} onChange={e => handleFieldChange('address', e.target.value)} placeholder="123 Main St, Anytown, USA" className="col-span-3" />
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
