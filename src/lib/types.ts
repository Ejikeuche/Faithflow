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
}
