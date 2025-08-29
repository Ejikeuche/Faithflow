"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Church } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from 'react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle authentication here
    // For this demo, we'll simulate roles based on email
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary p-4 text-primary-foreground">
            <Church className="h-10 w-10" />
          </div>
        </div>
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">FaithFlow</CardTitle>
            <CardDescription>
              Welcome back! Please sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="superuser@faithflow.com"
                  defaultValue="superuser@faithflow.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  defaultValue="password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
               <p className="text-xs text-center text-muted-foreground pt-2">
                Use superuser@faithflow.com, admin@faithflow.com, or member@faithflow.com to test roles.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
