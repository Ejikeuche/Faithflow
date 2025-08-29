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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const members = [
    { id: "1", name: "John Doe", email: "john.d@example.com", role: "Admin", joined: "2023-01-15" },
    { id: "2", name: "Jane Smith", email: "jane.s@example.com", role: "Member", joined: "2023-02-20" },
    { id: "3", name: "Sam Wilson", email: "sam.w@example.com", role: "Member", joined: "2022-11-10" },
    { id: "4", name: "Emily Brown", email: "emily.b@example.com", role: "Member", joined: "2023-05-01" },
    { id: "5", name: "Michael Johnson", email: "michael.j@example.com", role: "Member", joined: "2021-08-23" },
];

export default function MembersPage() {
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
            <Dialog>
                <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-4 w-4" />
                        Add Member
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Member</DialogTitle>
                        <DialogDescription>Fill in the details for the new member.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" defaultValue="Peter Jones" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" type="email" defaultValue="peter.j@example.com" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Member</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
