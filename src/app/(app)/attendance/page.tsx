"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const initialMembers = [
    { id: "1", name: "John Doe", email: "john.d@example.com", status: "Present" },
    { id: "2", name: "Jane Smith", email: "jane.s@example.com", status: "Present" },
    { id: "3", name: "Sam Wilson", email: "sam.w@example.com", status: "Absent" },
    { id: "4", name: "Emily Brown", email: "emily.b@example.com", status: "Present" },
    { id: "5", name: "Michael Johnson", email: "michael.j@example.com", status: "Present" },
    { id: "6", name: "Sarah Williams", email: "sarah.w@example.com", status: "Absent" },
    { id: "7", name: "David Jones", email: "david.j@example.com", status: "Present" },
];

type Member = typeof initialMembers[0];

export default function AttendancePage() {
    const { toast } = useToast();
    const [members, setMembers] = useState(initialMembers);
    const [selected, setSelected] = useState<string[]>(
        initialMembers.filter(m => m.status === 'Present').map(m => m.id)
    );

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(members.map(m => m.id));
        } else {
            setSelected([]);
        }
    };

    const handleSelect = (memberId: string, checked: boolean) => {
        if (checked) {
            setSelected(prev => [...prev, memberId]);
        } else {
            setSelected(prev => prev.filter(id => id !== memberId));
        }
    };
    
    const handleSave = () => {
        setMembers(prevMembers =>
            prevMembers.map(member => ({
                ...member,
                status: selected.includes(member.id) ? 'Present' : 'Absent',
            }))
        );
        toast({
            title: "Success!",
            description: "Attendance has been saved successfully.",
        });
    };

    const allSelected = selected.length === members.length;
    const isIndeterminate = selected.length > 0 && selected.length < members.length;


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">
          Track and manage attendance for services and events.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Sunday Service Attendance</CardTitle>
                        <CardDescription>Mark members who are present.</CardDescription>
                    </div>
                    <Button onClick={handleSave}>Save Attendance</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox 
                                    aria-label="Select all"
                                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                                    checked={allSelected}
                                    aria-checked={isIndeterminate ? "mixed" : allSelected}
                                 />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.id}>
                            <TableCell>
                                <Checkbox 
                                    checked={selected.includes(member.id)}
                                    onCheckedChange={(checked) => handleSelect(member.id, Boolean(checked))}
                                    aria-label={`Select ${member.name}`} />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="hidden h-9 w-9 sm:flex">
                                        <AvatarImage src={`https://avatar.vercel.sh/${member.email}.png`} alt={member.name} />
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{member.name}</div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={selected.includes(member.id) ? 'default' : 'outline'}>
                                    {selected.includes(member.id) ? 'Present' : 'Absent'}
                                </Badge>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                    <Calendar
                        mode="single"
                        selected={new Date()}
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
