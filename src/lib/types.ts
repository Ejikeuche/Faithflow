export type UserRole = "member" | "admin" | "superuser";

export interface User {
  name: string;
  email: string;
  role: UserRole;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "Member" | "Admin"; // Admin can manage members
  joined: string; // date string
  avatar: string;
}

export interface Church {
  id: string;
  name: string;
  location: string;
  members: number;
}

export interface Plan {
  id: string;
  name: string;
  memberLimit: {
    min: number;
    max: number | null;
  };
  price: number;
}

export interface SundaySchoolLesson {
    id: string;
    title: string;
    description: string;
    content: string;
    date: string;
}

export interface AttendanceRecord {
    id: string;
    date: string;
    serviceType: "Sunday Service" | "Midweek Service" | "Special Service";
    men: number;
    women: number;
    youth: number;
    children: number;
    total: number;
}

export interface Offering {
  id: string;
  name: string;
  email: string;
  amount: number;
  date: string;
  type: "Tithe" | "Personal" | "Building" | "Special";
}
