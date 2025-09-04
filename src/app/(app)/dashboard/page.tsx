
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, HandCoins, Church, UserCheck, Cake } from "lucide-react";
import Image from "next/image";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useUser } from "@/hooks/use-user";
import type { Member, Offering, AttendanceRecord, Church as ChurchType } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { subMonths, format, startOfMonth, getMonth, parseISO } from 'date-fns';
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getChurches as getChurchesAction } from "@/actions/church-actions";


const toMemberObject = (doc: any): Member => ({ id: doc.id, ...doc.data() } as Member);
const toOfferingObject = (doc: any): Offering => ({ id: doc.id, ...doc.data() } as Offering);
const toAttendanceRecordObject = (doc: any): AttendanceRecord => ({ id: doc.id, ...doc.data() } as AttendanceRecord);

const offeringChartConfig = {
  total: {
    label: "Total Offering",
  },
} satisfies ChartConfig;

const attendanceChartConfig = {
  average: {
    label: "Average Attendance",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const churchMembershipChartConfig = {
    members: {
        label: "Members",
    },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { user } = useUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [churches, setChurches] = useState<ChurchType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [memberTotalOffering, setMemberTotalOffering] = useState<number>(0);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Member[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const promises = [
            getDocs(query(collection(db, 'members'), orderBy("createdAt", "desc"))),
            getDocs(query(collection(db, 'offerings'), orderBy("date", "desc"))),
            getDocs(query(collection(db, 'attendance'), orderBy("date", "desc"))),
        ];

        if (user.role === 'superuser') {
            promises.push(getChurchesAction());
        } else {
             promises.push(getDocs(query(collection(db, 'churches'), orderBy("createdAt", "desc"))));
        }
        
        const [
          membersSnapshot,
          offeringsSnapshot,
          attendanceSnapshot,
          churchesResult,
        ] = await Promise.all(promises);
        
        const membersData = membersSnapshot.docs.map(toMemberObject);
        const offeringsData = offeringsSnapshot.docs.map(toOfferingObject);
        const attendanceData = attendanceSnapshot.docs.map(toAttendanceRecordObject);
        
        let churchesData: ChurchType[];
        if (Array.isArray(churchesResult)) {
            churchesData = churchesResult;
        } else {
            churchesData = churchesResult.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as ChurchType));
        }


        setMembers(membersData);
        setOfferings(offeringsData);
        setAttendanceRecords(attendanceData);
        setChurches(churchesData);

        if (user?.role === 'member' && user.email) {
            const memberOfferings = offeringsData.filter(o => o.email === user.email);
            const total = memberOfferings.reduce((acc, o) => acc + o.amount, 0);
            setMemberTotalOffering(total);
            
            const currentMonth = getMonth(new Date());
            const birthdays = membersData
              .filter(member => {
                if (!member.dob) return false;
                try {
                  const birthDate = parseISO(member.dob);
                  return getMonth(birthDate) === currentMonth;
                } catch (e) {
                  return false;
                }
              })
              .sort((a, b) => {
                 if (!a.dob || !b.dob) return 0;
                 const dateA = parseISO(a.dob);
                 const dateB = parseISO(b.dob);
                 return dateA.getDate() - dateB.getDate();
              });
            setUpcomingBirthdays(birthdays);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const processChartData = () => {
    const now = new Date();
    const monthlyData: { [key: string]: { offering: number; attendance: number; attendanceCount: number } } = {};

    for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthKey = format(monthDate, 'yyyy-MM');
        monthlyData[monthKey] = { offering: 0, attendance: 0, attendanceCount: 0 };
    }

    offerings.forEach(o => {
        if(!o.date) return;
        try {
            const recordDate = new Date(o.date);
            const monthKey = format(recordDate, 'yyyy-MM');
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].offering += o.amount;
            }
        } catch(e) {}
    });

    attendanceRecords.forEach(r => {
        if(!r.date) return;
        try {
            const recordDate = new Date(r.date);
            const monthKey = format(recordDate, 'yyyy-MM');
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].attendance += r.total;
                monthlyData[monthKey].attendanceCount += 1;
            }
        } catch(e) {}
    });

    return Object.entries(monthlyData).map(([key, value]) => ({
      month: format(startOfMonth(new Date(key)), 'MMMM'),
      total: value.offering,
      average: value.attendanceCount > 0 ? Math.round(value.attendance / value.attendanceCount) : 0,
    }));
  };

  const chartData = processChartData();
  
  const totalMembersAdmin = members.length;
  const totalOfferingAdmin = offerings.reduce((acc, o) => acc + o.amount, 0);
  const averageAttendanceAdmin = attendanceRecords.length > 0
      ? Math.round(attendanceRecords.reduce((acc, r) => acc + r.total, 0) / attendanceRecords.length)
      : 0;
      
  const totalMembersSuperuser = churches.reduce((acc, church) => acc + (church.members || 0), 0);


  if (isLoading) {
    return (
      <div className="space-y-8">
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <Skeleton className="h-28 w-full" />
           <Skeleton className="h-28 w-full" />
           <Skeleton className="h-28 w-full" />
           <Skeleton className="h-28 w-full" />
         </div>
         <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">An overview of your church community.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {user?.role === 'admin' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMembersAdmin.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Current members in this church</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Offering</CardTitle>
                <HandCoins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalOfferingAdmin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">All-time total recorded</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageAttendanceAdmin.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Average across all services</p>
              </CardContent>
            </Card>
          </>
        )}
        {user?.role === 'member' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 col-span-4">
            <Card className="lg:col-span-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Total Offering</CardTitle>
                    <HandCoins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${memberTotalOffering.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <p className="text-xs text-muted-foreground">Thank you for your generosity!</p>
                </CardContent>
            </Card>
            <Card className="lg:col-span-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cake className="h-5 w-5 text-primary"/>
                        Upcoming Birthdays This Month
                    </CardTitle>
                    <CardDescription>Celebrating our members!</CardDescription>
                </CardHeader>
                <CardContent>
                    {upcomingBirthdays.length > 0 ? (
                    <ul className="space-y-3">
                        {upcomingBirthdays.map(member => {
                            if (!member.dob) return null;
                            try {
                                const birthDate = parseISO(member.dob);
                                return (
                                <li key={member.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={`https://avatar.vercel.sh/${member.email}.png`} alt={member.name} />
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{member.name}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{format(birthDate, 'MMMM d')}</span>
                                </li>
                                )
                            } catch (e) {
                                return null;
                            }
                        })}
                    </ul>
                    ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No birthdays this month.</p>
                    )}
                </CardContent>
            </Card>
          </div>
        )}
         {user?.role === 'superuser' && (
           <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMembersSuperuser.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all churches</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churches Managed</CardTitle>
                <Church className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{churches.length}</div>
                <p className="text-xs text-muted-foreground">Total registered churches</p>
              </CardContent>
            </Card>
           </>
        )}
      </div>

      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Offering Analytics</CardTitle>
              <CardDescription>Monthly offering over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={offeringChartConfig} className="h-[250px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Attendance Analytics</CardTitle>
              <CardDescription>Average attendance over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={attendanceChartConfig} className="h-[250px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar
                      dataKey="average"
                      fill="hsl(var(--primary))"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

       {user?.role === "superuser" && (
        <div className="grid grid-cols-1 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Church Membership</CardTitle>
                    <CardDescription>Membership numbers across all churches.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={churchMembershipChartConfig} className="h-[350px] w-full">
                        <BarChart accessibilityLayer data={churches} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} width={120} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar dataKey="members" layout="vertical" fill="hsl(var(--primary))" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to FaithFlow</CardTitle>
            <CardDescription>Your all-in-one solution for church management.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="relative aspect-video w-full">
                <Image src="https://picsum.photos/1200/600" alt="Church community" fill className="rounded-md object-cover" data-ai-hint="church community" />
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    