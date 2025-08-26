import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  DollarSign,
  UserCheck
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalCommunities: number;
  totalEvents: number;
  totalDiscussions: number;
  totalRegistrations: number;
  totalRevenue: number;
  activeDiscussions: number;
  flaggedContent: number;
  userGrowth: Array<{ date: string; users: number }>;
  eventRegistrations: Array<{ date: string; registrations: number }>;
  communityGrowth: Array<{ name: string; members: number }>;
  registrationStatus: Array<{ name: string; value: number; color: string }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  userActivity: Array<{ action: string; count: number }>;
}

const COLORS = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  destructive: 'hsl(var(--destructive))',
  muted: 'hsl(var(--muted-foreground))'
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.destructive,
  COLORS.muted
];

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      // Fetch basic counts
      const [
        usersResult,
        communitiesResult,
        eventsResult,
        discussionsResult,
        registrationsResult,
        flagsResult
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('communities').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('discussions').select('*', { count: 'exact', head: true }),
        supabase.from('event_registrations').select('*', { count: 'exact', head: true }),
        supabase.from('flags').select('*', { count: 'exact', head: true })
      ]);

      // Fetch active discussions (not expired)
      const { count: activeDiscussions } = await supabase
        .from('discussions')
        .select('*', { count: 'exact', head: true })
        .gt('expires_at', new Date().toISOString());

      // Fetch user growth data
      const { data: userGrowthData } = await supabase
        .from('users')
        .select('created_at')
        .order('created_at', { ascending: true });

      // Fetch event registrations over time
      const { data: registrationGrowthData } = await supabase
        .from('event_registrations')
        .select('created_at')
        .order('created_at', { ascending: true });

      // Fetch community member counts
      const { data: communityData } = await supabase
        .from('communities')
        .select(`
          name,
          community_members(count)
        `);

      // Fetch registration status distribution
      const { data: registrationStatusData } = await supabase
        .from('event_registrations')
        .select('status');

      // Fetch payment sessions for revenue
      const { data: paymentData } = await supabase
        .from('payment_sessions')
        .select('amount, created_at, status')
        .eq('status', 'completed');

      // Fetch user activity
      const { data: activityData } = await supabase
        .from('user_activity_log')
        .select('action_type')
        .order('timestamp', { ascending: false })
        .limit(1000);

      // Process user growth data
      const userGrowth = userGrowthData?.reduce((acc: { [key: string]: number }, user) => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}) || {};

      const userGrowthChart = Object.entries(userGrowth)
        .slice(-30) // Last 30 days
        .map(([date, users]) => ({ date, users: users as number }));

      // Process registration growth
      const registrationGrowth = registrationGrowthData?.reduce((acc: { [key: string]: number }, reg) => {
        const date = new Date(reg.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}) || {};

      const registrationChart = Object.entries(registrationGrowth)
        .slice(-30)
        .map(([date, registrations]) => ({ date, registrations: registrations as number }));

      // Process community growth
      const communityGrowth = communityData?.map(community => ({
        name: community.name,
        members: community.community_members?.[0]?.count || 0
      })) || [];

      // Process registration status
      const statusCounts = registrationStatusData?.reduce((acc: { [key: string]: number }, reg) => {
        acc[reg.status] = (acc[reg.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const registrationStatus = Object.entries(statusCounts).map(([name, value], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: value as number,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }));

      // Calculate total revenue
      const totalRevenue = paymentData?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      // Process monthly revenue
      const monthlyRevenueData = paymentData?.reduce((acc: { [key: string]: number }, payment) => {
        const month = new Date(payment.created_at).toISOString().slice(0, 7);
        acc[month] = (acc[month] || 0) + Number(payment.amount);
        return acc;
      }, {}) || {};

      const monthlyRevenue = Object.entries(monthlyRevenueData)
        .slice(-12) // Last 12 months
        .map(([month, revenue]) => ({ month, revenue: revenue as number }));

      // Process user activity
      const activityCounts = activityData?.reduce((acc: { [key: string]: number }, activity) => {
        acc[activity.action_type] = (acc[activity.action_type] || 0) + 1;
        return acc;
      }, {}) || {};

      const userActivity = Object.entries(activityCounts)
        .map(([action, count]) => ({ action, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalUsers: usersResult.count || 0,
        totalCommunities: communitiesResult.count || 0,
        totalEvents: eventsResult.count || 0,
        totalDiscussions: discussionsResult.count || 0,
        totalRegistrations: registrationsResult.count || 0,
        totalRevenue,
        activeDiscussions: activeDiscussions || 0,
        flaggedContent: flagsResult.count || 0,
        userGrowth: userGrowthChart,
        eventRegistrations: registrationChart,
        communityGrowth,
        registrationStatus,
        monthlyRevenue,
        userActivity
      };
    }
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Loading comprehensive platform analytics...
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="admin-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded w-32 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const MetricCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend,
    className = "" 
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    trend?: { value: number; label: string };
    className?: string;
  }) => (
    <Card className={`admin-shadow ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center space-x-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <Badge variant={trend.value > 0 ? "default" : "secondary"} className="text-xs">
              {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your platform's performance and user engagement.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={analytics.totalUsers}
          description="Registered platform users"
          icon={Users}
        />
        <MetricCard
          title="Communities"
          value={analytics.totalCommunities}
          description="Active communities"
          icon={UserCheck}
        />
        <MetricCard
          title="Events"
          value={analytics.totalEvents}
          description="Total events created"
          icon={Calendar}
        />
        <MetricCard
          title="Registrations"
          value={analytics.totalRegistrations}
          description="Event registrations"
          icon={TrendingUp}
        />
        <MetricCard
          title="Active Discussions"
          value={analytics.activeDiscussions}
          description="Currently active"
          icon={MessageSquare}
        />
        <MetricCard
          title="Total Revenue"
          value={`₹${analytics.totalRevenue.toLocaleString()}`}
          description="From event registrations"
          icon={DollarSign}
        />
        <MetricCard
          title="User Activity"
          value={analytics.userActivity.reduce((sum, item) => sum + item.count, 0)}
          description="Recent actions"
          icon={Activity}
        />
        <MetricCard
          title="Flagged Content"
          value={analytics.flaggedContent}
          description="Requires moderation"
          icon={AlertTriangle}
          className={analytics.flaggedContent > 0 ? "border-warning" : ""}
        />
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">Growth Trends</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="admin-shadow">
              <CardHeader>
                <CardTitle>User Growth (Last 30 Days)</CardTitle>
                <CardDescription>Daily new user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="admin-shadow">
              <CardHeader>
                <CardTitle>Event Registrations (Last 30 Days)</CardTitle>
                <CardDescription>Daily event registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.eventRegistrations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="registrations" 
                      stroke={COLORS.success}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="admin-shadow">
              <CardHeader>
                <CardTitle>Community Membership</CardTitle>
                <CardDescription>Members per community</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.communityGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="members" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="admin-shadow">
              <CardHeader>
                <CardTitle>Registration Status</CardTitle>
                <CardDescription>Event registration distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.registrationStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics.registrationStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {analytics.registrationStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card className="admin-shadow">
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue from event registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={COLORS.success}
                    fill={COLORS.success}
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="admin-shadow">
            <CardHeader>
              <CardTitle>User Activity Breakdown</CardTitle>
              <CardDescription>Most common user actions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.userActivity} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    dataKey="action" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}