
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
import { addAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord } from "@/actions/attendance-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const emptyRecord: Omit<AttendanceRecord, 'id' | 'createdAt' | 'total'> = {
  date: new Date().toISOString().split("T")[0],
  serviceType: "Sunday Service",
  men: 0,
  women: 0,
  youth: 0,
  children: 0,
};

const toAttendanceRecordObject = (doc: any): AttendanceRecord => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data
    } as AttendanceRecord;
};

export default function AttendancePage() {
  const { toast } = useToast();
  const { user } = useUser();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Omit<AttendanceRecord, 'createdAt' | 'total'> | Omit<AttendanceRecord, 'id' | 'createdAt' | 'total'> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const attendanceCollection = collection(db, 'attendance');
      const q = query(attendanceCollection, orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const fetchedRecords = snapshot.docs.map(toAttendanceRecordObject);
      setRecords(fetchedRecords);
    } catch (error) {
      console.error("Failed to fetch attendance records:", error);
      toast({ title: "Error", description: "Could not fetch attendance records.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchRecords();
    }
  }, [user, toast]);

  const calculateTotal = (record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'total'>) => {
    return (Number(record.men) || 0) + (Number(record.women) || 0) + (Number(record.youth) || 0) + (Number(record.children) || 0);
  }

  const handleAddClick = () => {
    setSelectedRecord(emptyRecord);
    setIsDialogOpen(true);
  };

  const handleEditClick = (record: AttendanceRecord) => {
    const { createdAt, ...editableRecord } = record;
    setSelectedRecord(editableRecord);
    setIsDialogOpen(true);
  };

  const handleDelete = async (recordId: string) => {
    try {
      await deleteAttendanceRecord(recordId);
      setRecords(records.filter((r) => r.id !== recordId));
      toast({ title: "Record Deleted", description: "The attendance record has been removed." });
    } catch (error) {
      console.error("Failed to delete record:", error);
      toast({ title: "Error", description: "Could not delete the record.", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!selectedRecord?.date || !selectedRecord?.serviceType) {
      toast({ title: "Error", description: "Date and Service Type are required.", variant: "destructive" });
      return;
    }

    const total = calculateTotal(selectedRecord);
    const recordToSave = { ...selectedRecord, total };

    try {
      if ('id' in recordToSave && recordToSave.id) {
        await updateAttendanceRecord(recordToSave as Omit<AttendanceRecord, 'createdAt'>);
        toast({ title: "Record Updated", description: `The attendance record has been updated.` });
      } else {
        await addAttendanceRecord(recordToSave as Omit<AttendanceRecord, 'id' | 'createdAt'>);
        toast({ title: "Record Added", description: `A new attendance record has been added.` });
      }
      fetchRecords(); // Refetch data
      setIsDialogOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error("Failed to save record:", error);
      toast({ title: "Error", description: "Could not save the record.", variant: "destructive" });
    }
  };

  const handleFieldChange = (field: keyof Omit<AttendanceRecord, 'id' | 'createdAt' | 'total'>, value: string | number) => {
    if (selectedRecord) {
        setSelectedRecord(prev => prev ? { ...prev, [field]: value } : null);
    }
  };
  
  const parseDate = (dateString: string) => {
    if (!dateString) return new Date();
    const date = new Date(dateString);
     if (dateString && !dateString.includes('T')) {
      date.setUTCHours(0,0,0,0);
    }
    return date;
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
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{selectedRecord && 'id' in selectedRecord ? "Edit Attendance Record" : "Add New Record"}</DialogTitle>
            <DialogDescription>
              {selectedRecord && 'id' in selectedRecord ? "Update the attendance details." : "Fill in the details for the new record."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input id="date" type="date" value={selectedRecord?.date || ''} onChange={(e) => handleFieldChange("date", e.target.value)} className="col-span-3" />
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
              <Input id="men" type="number" min="0" value={selectedRecord?.men || 0} onChange={(e) => handleFieldChange("men", Number(e.target.value))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="women" className="text-right">Women</Label>
              <Input id="women" type="number" min="0" value={selectedRecord?.women || 0} onChange={(e) => handleFieldChange("women", Number(e.target.value))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="youth" className="text-right">Youth</Label>
              <Input id="youth" type="number" min="0" value={selectedRecord?.youth || 0} onChange={(e) => handleFieldChange("youth", Number(e.target.value))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="children" className="text-right">Children</Label>
              <Input id="children" type="number" min="0" value={selectedRecord?.children || 0} onChange={(e) => handleFieldChange("children", Number(e.target.value))} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total" className="text-right font-bold">Total</Label>
              <Input id="total" type="number" value={selectedRecord ? calculateTotal(selectedRecord as Omit<AttendanceRecord, 'id' | 'createdAt' | 'total'>) : 0} disabled className="col-span-3 font-bold" />
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
