
"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Plan } from "@/lib/types";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/actions/create-checkout-session";
import { getStripe } from "@/lib/stripe-client";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";

const toPlanObject = (doc: any): Plan => {
  const data = doc.data();
  return {
      id: doc.id,
      name: data?.name,
      memberLimit: data?.memberLimit,
      price: data?.price,
  };
};

export default function PlansPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const currentPlanId = "basic"; // Mock current plan for demo

  useEffect(() => {
    const fetchPlans = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const plansCollection = collection(db, 'plans');
        const snapshot = await getDocs(plansCollection);
        
        let fetchedPlans: Plan[] = [];
        if (snapshot.empty) {
          // If no plans exist, initialize them
          // This should ideally be a backend function, but for demo purposes we can do it here.
          const initialPlans: Omit<Plan, 'id'>[] = [
            { name: "Basic", memberLimit: { min: 0, max: 100 }, price: 29 },
            { name: "Premium", memberLimit: { min: 101, max: 250 }, price: 79 },
            { name: "Premium Plus", memberLimit: { min: 251, max: null }, price: 149 },
          ];
          const planIds = ["basic", "premium", "premium-plus"];
          
          for(let i = 0; i < initialPlans.length; i++) {
              const planId = planIds[i];
              const planData = initialPlans[i];
              await setDoc(doc(db, "plans", planId), planData);
              fetchedPlans.push({ ...planData, id: planId });
          }
          fetchedPlans.sort((a,b) => a.memberLimit.min - b.memberLimit.min);
        } else {
           fetchedPlans = snapshot.docs.map(toPlanObject);
           fetchedPlans.sort((a, b) => a.memberLimit.min - b.memberLimit.min);
        }
        setPlans(fetchedPlans);

      } catch (error) {
        console.error("Failed to fetch plans:", error);
        toast({ title: "Error", description: "Could not fetch plans.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, [user, toast]);

  const handleEditClick = (plan: Plan) => {
    setSelectedPlan({ ...plan });
    setIsEditing(true);
  };

  const handleSelectClick = async (plan: Plan) => {
    if (user?.role !== 'admin') return;
    
    setIsRedirecting(true);
    try {
      const { sessionId } = await createCheckoutSession({ plan });
      const stripe = await getStripe();
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      } else {
        throw new Error("Stripe.js not loaded");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsRedirecting(false);
    }
  };

  const handleSave = async () => {
    if (selectedPlan) {
      try {
        const { id, ...planData } = selectedPlan;
        await setDoc(doc(db, "plans", id), planData, { merge: true });
        setPlans(
          plans.map((p) => (p.id === id ? selectedPlan : p))
        );
        toast({ title: "Plan Saved", description: `${selectedPlan.name} has been updated.`});
      } catch (error) {
        toast({ title: "Error", description: "Could not save the plan.", variant: "destructive" });
        console.error("Failed to save plan:", error);
      }
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

  const renderButton = (plan: Plan) => {
    if (user?.role === "superuser") {
      return <Button className="w-full" onClick={() => handleEditClick(plan)}>Edit Plan</Button>;
    }
    if (user?.role === "admin") {
      if (plan.id === currentPlanId) {
        return <Button className="w-full" disabled>Current Plan</Button>;
      }
      return (
        <Button className="w-full" onClick={() => handleSelectClick(plan)} disabled={isRedirecting}>
          {isRedirecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Select Plan
        </Button>
      );
    }
    return null;
  }
  
  if (isLoading) {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-9 w-1/3" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground">
          {user?.role === 'superuser' ? 'Manage the subscription plans for churches.' : 'Choose the best plan for your church.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col ${plan.id === currentPlanId && user?.role === 'admin' ? 'border-primary' : ''}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                For churches with{" "}
                {plan.memberLimit.max
                  ? `${plan.memberLimit.min.toLocaleString()} - ${plan.memberLimit.max.toLocaleString()}`
                  : `${plan.memberLimit.min.toLocaleString()}+`}{" "}
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
              {renderButton(plan)}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Dialog for Superuser */}
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
