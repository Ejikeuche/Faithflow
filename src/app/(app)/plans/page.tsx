"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { Plan } from "@/lib/types";

const initialPlans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    memberLimit: { min: 0, max: 100 },
    price: 29,
  },
  {
    id: "premium",
    name: "Premium",
    memberLimit: { min: 101, max: 250 },
    price: 79,
  },
  {
    id: "premium-plus",
    name: "Premium Plus",
    memberLimit: { min: 251, max: null },
    price: 149,
  },
];

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = (plan: Plan) => {
    setSelectedPlan({ ...plan });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedPlan) {
      setPlans(
        plans.map((p) => (p.id === selectedPlan.id ? selectedPlan : p))
      );
    }
    setIsEditing(false);
    setSelectedPlan(null);
  };

  const handleFieldChange = (field: keyof Plan, value: any) => {
    if (selectedPlan) {
      setSelectedPlan({ ...selectedPlan, [field]: value });
    }
  };
  
    const handleMemberLimitChange = (field: 'min' | 'max', value: string) => {
    if (selectedPlan) {
      const numericValue = value === '' ? null : Number(value);
      setSelectedPlan({
        ...selectedPlan,
        memberLimit: {
          ...selectedPlan.memberLimit,
          [field]: numericValue,
        },
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Manage the subscription plans for churches.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                For churches with{" "}
                {plan.memberLimit.max
                  ? `${plan.memberLimit.min} - ${plan.memberLimit.max}`
                  : `${plan.memberLimit.min}+`}{" "}
                members.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleEditClick(plan)}>
                Edit Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>
              Update the details for the {selectedPlan?.name} plan.
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-name" className="text-right">
                  Plan Name
                </Label>
                <Input
                  id="plan-name"
                  value={selectedPlan.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="min-members" className="text-right">
                  Min Members
                </Label>
                <Input
                  id="min-members"
                  type="number"
                  value={selectedPlan.memberLimit.min}
                  onChange={(e) => handleMemberLimitChange("min", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="max-members" className="text-right">
                  Max Members
                </Label>
                <Input
                  id="max-members"
                  type="number"
                  value={selectedPlan.memberLimit.max ?? ""}
                  placeholder="No limit"
                  onChange={(e) => handleMemberLimitChange("max", e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price ($)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={selectedPlan.price}
                  onChange={(e) =>
                    handleFieldChange("price", Number(e.target.value))
                  }
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
