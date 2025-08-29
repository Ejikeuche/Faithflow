
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
  TableFooter
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Offering } from "@/lib/types";
import { format, isValid } from "date-fns";

const initialOfferings: Offering[] = [
  { id: "1", name: "John Doe", email: "john.d@example.com", amount: 150.00, date: "2024-07-21", type: "Tithe" },
  { id: "2", name: "Jane Smith", email: "jane.s@example.com", amount: 75.50, date: "2024-07-21", type: "Personal" },
  { id: "3", name: "Sam Wilson", email: "sam.w@example.com", amount: 500.00, date: "2024-07-20", type: "Building" },
  { id: "4", name: "Emily Brown", email: "emily.b@example.com", amount: 200.00, date: "2024-07-19", type: "Special" },
];

const emptyOffering: Omit<Offering, 'id'> = {
  name: "",
  email: "",
  amount: 0,
  date: new Date().toISOString().split("T")[0],
  type: "Tithe",
};


export function OfferingManager() {
  const { toast } = useToast();
  const [offerings, setOfferings] = useState(initialOfferings);
  const [selectedOffering, setSelectedOffering] = useState<Omit<Offering, 'id'> & { id?: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddClick = () => {
    setSelectedOffering(emptyOffering);
    setIsDialogOpen(true);
  };

  const handleEditClick = (offering: Offering) => {
    setSelectedOffering(offering);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (offeringId: string) => {
    setOfferings(offerings.filter(o => o.id !== offeringId));
    toast({ title: "Offering Deleted", description: "The offering record has been removed." });
  };

  const handleSave = () => {
    if (!selectedOffering?.name || !selectedOffering?.email || !selectedOffering?.date || !selectedOffering.type ) {
        toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
        return;
    }

    if (selectedOffering.id) {
        setOfferings(offerings.map(o => o.id === selectedOffering.id ? selectedOffering as Offering : o));
        toast({ title: "Offering Updated", description: `The record has been updated.` });
    } else {
        const newOffering: Offering = { ...selectedOffering, id: (offerings.length + 1).toString() } as Offering;
        setOfferings([...offerings, newOffering]);
        toast({ title: "Offering Added", description: `A new offering record has been added.` });
    }
    setIsDialogOpen(false);
    setSelectedOffering(null);
  };

  const handleFieldChange = (field: keyof Omit<Offering, 'id'>, value: string | number) => {
    if (selectedOffering) {
        setSelectedOffering(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const getOfferingTypeVariant = (type: Offering['type']) => {
    switch (type) {
      case 'Tithe': return 'default';
      case 'Building': return 'destructive';
      case 'Special': return 'secondary';
      case 'Personal': return 'outline';
      default: return 'default';
    }
  }

  const grandTotal = offerings.reduce((acc, record) => acc + record.amount, 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Offering Records</CardTitle>
            <CardDescription>A log of all recorded offerings.</CardDescription>
          </div>
          <Button size="sm" className="gap-1" onClick={handleAddClick}>
            <PlusCircle className="h-4 w-4" />
            Add Offering
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contributor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offerings.map((offering) => (
                <TableRow key={offering.id}>
                  <TableCell>
                    <div className="font-medium">{offering.name}</div>
                    <div className="text-sm text-muted-foreground">{offering.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getOfferingTypeVariant(offering.type)}>{offering.type}</Badge>
                  </TableCell>
                  <TableCell>
                     {isValid(new Date(offering.date)) ? format(new Date(offering.date), "PPP") : 'Invalid Date'}
                  </TableCell>
                  <TableCell className="text-right">${offering.amount.toFixed(2)}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEditClick(offering)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(offering.id)} className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
             <TableFooter>
                <TableRow>
                    <TableCell colSpan={3} className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{selectedOffering?.id ? "Edit Offering Record" : "Add New Offering"}</DialogTitle>
            <DialogDescription>
              {selectedOffering?.id ? "Update the offering details." : "Fill in the details for the new record."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={selectedOffering?.name} onChange={(e) => handleFieldChange("name", e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" value={selectedOffering?.email} onChange={(e) => handleFieldChange("email", e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input id="date" type="date" value={selectedOffering?.date} onChange={(e) => handleFieldChange("date", e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select value={selectedOffering?.type} onValueChange={(value: Offering['type']) => handleFieldChange("type", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tithe">Tithe</SelectItem>
                  <SelectItem value="Personal">Personal Offering</SelectItem>
                  <SelectItem value="Building">Building Offering</SelectItem>
                  <SelectItem value="Special">Special Offering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount</Label>
              <Input id="amount" type="number" min="0" value={selectedOffering?.amount} onChange={(e) => handleFieldChange("amount", Number(e.target.value))} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSave}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
