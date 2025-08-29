export type UserRole = "member" | "admin" | "superuser";

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
