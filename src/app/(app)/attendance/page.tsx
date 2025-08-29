
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
  TableFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { AttendanceRecord } from "@/lib/types";
import { format, isValid } from "date-fns";

const initialRecords: AttendanceRecord[] = [
  { id: "1", date: "2024-07-21", serviceType: "Sunday Service", men: 50, women: 65, youth: 30, children: 25, total: 170 },
  { id: "2", date: "2024-07-24", serviceType: "Midweek Service", men: 25, women: 30, youth: 15, children: 10, total: 80 },
  { id: "3", date: "2024-07-28", serviceType: "Sunday Service", men: 55, women: 70, youth: 35, children: 30, total: 190 },
];

const emptyRecord: Omit<AttendanceRecord, 'id' | 'total'> = {
  date: new Date().toISOString().split("T")[0],
  serviceType: "Sunday Service",
  men: 0,
  women: 0,
  youth: 0,
  children: 0,
};

export default function AttendancePage() {
  const { toast } = useToast();
  const [records, setRecords] = useState(initialRecords);
  const [selectedRecord, setSelectedRecord] = useState<Omit<AttendanceRecord, 'id' | 'total'> & { id?: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const calculateTotal = (record: Omit<AttendanceRecord, 'id' | 'total'>) => {
    return (record.men || 0) + (record.women || 0) + (record.youth || 0) + (record.children || 0);
  }

  const handleAddClick = () => {
    setSelectedRecord(emptyRecord);
    setIsDialogOpen(true);
  };

  const handleEditClick = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsDialogOpen(true);
  };

  const handleDelete = (recordId: string) => {
    setRecords(records.filter((r) => r.id !== recordId));
    toast({ title: "Record Deleted", description: "The attendance record has been removed." });
  };

  const handleSave = () => {
    if (!selectedRecord?.date || !selectedRecord?.serviceType) {
      toast({ title: "Error", description: "Date and Service Type are required.", variant: "destructive" });
      return;
    }

    const total = calculateTotal(selectedRecord);

    if (selectedRecord.id) {
      setRecords(
        records.map((r) => (r.id === selectedRecord.id ? { ...selectedRecord, total } as AttendanceRecord : r))
      );
      toast({ title: "Record Updated", description: `The attendance record has been updated.` });
    } else {
      const newRecord: AttendanceRecord = { ...selectedRecord, id: (records.length + 1).toString(), total };
      setRecords([...records, newRecord]);
      toast({ title: "Record Added", description: `A new attendance record has been added.` });
    }
    setIsDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleFieldChange = (field: keyof Omit<AttendanceRecord, 'id' | 'total' >, value: string | number) => {
    if (selectedRecord) {
        if (['men', 'women', 'youth', 'children'].includes(field as string)) {
            setSelectedRecord(prev => prev ? { ...prev, [field]: Number(value) } : null);
        } else {
            setSelectedRecord(prev => prev ? { ...prev, [field]: value } : null);
        }
    }
  };
  
  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const grandTotal = records.reduce((acc, record) => acc + record.total, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Register</h1>
        <p className="text-muted-foreground">
          Record and manage attendance for church services.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Service Attendance</CardTitle>
            <CardDescription>A log of attendance for all services.</CardDescription>
          </div>
          <Button size="sm" className="gap-1" onClick={handleAddClick}>
            <PlusCircle className="h-4 w-4" />
            Add Record
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="text-right">Men</TableHead>
                <TableHead className="text-right">Women</TableHead>
                <TableHead className="text-right">Youth</TableHead>
                <TableHead className="text-right">Children</TableHead>
                <TableHead className="text-right font-bold">Total</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => {
                const date = parseDate(record.date);
                return (
                  <TableRow key={record.id}>
                    <TableCell>
                      {isValid(date) ? format(date, "PPP") : 'Invalid Date'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.serviceType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{record.men}</TableCell>
                    <TableCell className="text-right">{record.women}</TableCell>
                    <TableCell className="text-right">{record.youth}</TableCell>
                    <TableCell className="text-right">{record.children}</TableCell>
                    <TableCell className="text-right font-medium">{record.total}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditClick(record)}>Edit</DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the attendance record.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(record.id)}>Continue</AlertDialogAction>
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
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={6} className="font-bold">Grand Total</TableCell>
                    <TableCell className="text-right font-bold">{grandTotal.toLocaleString()}</TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{selectedRecord?.id ? "Edit Attendance Record" : "Add New Record"}</DialogTitle>
            <DialogDescription>
              {selectedRecord?.id ? "Update the attendance details." : "Fill in the details for the new record."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input id="date" type="date" value={selectedRecord?.date} onChange={(e) => handleFieldChange("date", e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serviceType" className="text-right">Service</Label>
              <Select value={selectedRecord?.serviceType} onValueChange={(value) => handleFieldChange("serviceType", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                  <SelectItem value="Midweek Service">Midweek Service</SelectItem>
                  <SelectItem value="Special Service">Special Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="men" className="text-right">Men</Label>
              <Input id="men" type="number" min="0" value={selectedRecord?.men} onChange={(e) => handleFieldChange("men", e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="women" className="text-right">Women</Label>
              <Input id="women" type="number" min="0" value={selectedRecord?.women} onChange={(e) => handleFieldChange("women", e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="youth" className="text-right">Youth</Label>
              <Input id="youth" type="number" min="0" value={selectedRecord?.youth} onChange={(e) => handleFieldChange("youth", e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="children" className="text-right">Children</Label>
              <Input id="children" type="number" min="0" value={selectedRecord?.children} onChange={(e) => handleFieldChange("children", e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total" className="text-right font-bold">Total</Label>
              <Input id="total" type="number" value={selectedRecord ? calculateTotal(selectedRecord) : 0} disabled className="col-span-3 font-bold" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSave}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
