
"use client";
import { type ReactNode, useState, useEffect } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Church, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { User as UserType, UserRole } from "@/lib/types";
import { UserProvider } from "@/hooks/use-user";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser && authUser.email) {
        // Assign role based on email for demo purposes
        let role: UserRole = "member"; // Default role
        if (authUser.email.startsWith('superuser@')) {
            role = "superuser";
        } else if (authUser.email.startsWith('admin@')) {
            role = "admin";
        }

        setUser({
          name: authUser.displayName || authUser.email.split('@')[0],
          email: authUser.email,
          role: role,
        });
      } else {
        setUser(null);
        router.push("/");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push("/");
    } catch (error) {
      toast({ title: "Error", description: "Failed to log out.", variant: "destructive" });
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UserProvider user={user}>
      <SidebarProvider>
        <Sidebar>
          <SidebarNav role={user.role} />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6 sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden items-center gap-2 md:flex">
                <Church className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-semibold font-headline">FaithFlow</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm hidden sm:block">
                <span className="text-muted-foreground">Signed in as: </span>
                <span className="font-semibold capitalize">{user.role}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${user.email}.png`}
                        alt={user.name}
                      />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}
