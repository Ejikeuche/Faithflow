
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, HandCoins, Church, UserCheck } from "lucide-react";
import Image from "next/image";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useUser } from "@/hooks/use-user";

const offeringData = [
  { month: "January", total: 12345 },
  { month: "February", total: 15678 },
  { month: "March", total: 18901 },
  { month: "April", total: 17532 },
  { month: "May", total: 20145 },
  { month: "June", total: 22876 },
];

const offeringChartConfig = {
  total: {
    label: "Total Offering",
  },
} satisfies ChartConfig

const attendanceData = [
  { month: "January", average: 650 },
  { month: "February", average: 700 },
  { month: "March", average: 750 },
  { month: "April", average: 720 },
  { month: "May", average: 800 },
  { month: "June", average: 852 },
];

const attendanceChartConfig = {
  average: {
    label: "Average Attendance",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const churchMembershipData = [
    { name: "First Community", members: 1234 },
    { name: "Grace Chapel", members: 852 },
    { name: "New Hope", members: 450 },
    { name: "Redemption Hill", members: 2100 },
];

const churchMembershipChartConfig = {
    members: {
        label: "Members",
    },
} satisfies ChartConfig;

const totalMembersSuperuser = churchMembershipData.reduce((acc, church) => acc + church.members, 0);


export default function DashboardPage() {
  const { user } = useUser();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">An overview of your church community.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.role === 'superuser' ? totalMembersSuperuser.toLocaleString() : '1,234'}
            </div>
             <p className="text-xs text-muted-foreground">
              {user?.role === 'superuser' ? 'Across all churches' : '+20.1% from last month'}
            </p>
          </CardContent>
        </Card>
        {user?.role !== 'superuser' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Offering</CardTitle>
              <HandCoins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">+180.1% from last month</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">852</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churches Managed</CardTitle>
            <Church className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Superuser view</p>
          </CardContent>
        </Card>
      </div>

      {user?.role !== 'superuser' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Offering Analytics</CardTitle>
              <CardDescription>Monthly offering over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={offeringChartConfig} className="h-[250px] w-full">
                <BarChart accessibilityLayer data={offeringData}>
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
                  <LineChart
                    accessibilityLayer
                    data={attendanceData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
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
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Line
                      dataKey="average"
                      type="natural"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
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
                        <BarChart accessibilityLayer data={churchMembershipData} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid horizontal={false} />
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} />
                            <XAxis dataKey="members" type="number" hide />
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
