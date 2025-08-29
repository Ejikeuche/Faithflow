"use client";
import { type ReactNode, useState, useEffect, createContext } from "react";
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
import { Church, LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import type { User as UserType, UserRole } from "@/lib/types";
import { UserProvider } from "@/hooks/use-user";

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserType>({ name: "Super User", email: "superuser@faithflow.com", role: "superuser" });

  // In a real app, this would be derived from a session.
  // We simulate role changes for the demo.
  const handleRoleChange = (role: UserRole) => {
    if (role === 'admin') {
      setUser({ name: "Admin User", email: "admin@faithflow.com", role: "admin" });
    } else if (role === 'member') {
      setUser({ name: "Member User", email: "member@faithflow.com", role: "member" });
    } else {
      setUser({ name: "Super User", email: "superuser@faithflow.com", role: "superuser" });
    }
  };

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
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
                   <DropdownMenuLabel>Change Role (Demo)</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleRoleChange('superuser')}>Superuser</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange('admin')}>Admin</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange('member')}>Member</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/')}>
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
