'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  FolderOpen,
  Zap,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  totalUpdates: number;
  pendingApprovals: number;
  completedToday: number;
  overdueTasks: number;
  teamMembers: number;
  aiAnalysisAccuracy: number;
}

interface ChartData {
  date: string;
  updates: number;
  approved: number;
}

interface ProjectMetrics {
  name: string;
  value: number;
  status: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [projectData, setProjectData] = useState<ProjectMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics');
        const data = await response.json();

        if (data.success) {
          setMetrics(data.data.metrics);
          setChartData(data.data.chartData);
          setProjectData(data.data.projectMetrics);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center text-gray-600">
        Failed to load dashboard data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Image
          src="/pinnacle-logo.svg"
          alt="Pinnacle Power Corp"
          width={120}
          height={48}
          className="object-contain"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here&apos;s your project overview.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeProjects}</div>
            <p className="text-xs text-gray-600 mt-1">
              of {metrics.totalProjects} total
            </p>
          </CardContent>
        </Card>

        {/* Daily Updates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Updates</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completedToday}</div>
            <p className="text-xs text-gray-600 mt-1">
              Completed today
            </p>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingApprovals}</div>
            <p className="text-xs text-gray-600 mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overdueTasks}</div>
            <p className="text-xs text-gray-600 mt-1">
              Need attention
            </p>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.teamMembers}</div>
            <p className="text-xs text-gray-600 mt-1">
              Active users
            </p>
          </CardContent>
        </Card>

        {/* AI Accuracy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.aiAnalysisAccuracy}%</div>
            <p className="text-xs text-gray-600 mt-1">
              Analysis confidence
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Updates Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Updates Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="updates" stroke="#3b82f6" />
                <Line type="monotone" dataKey="approved" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>Create New Project</Button>
          <Button variant="outline">View All Updates</Button>
          <Button variant="outline">Team Settings</Button>
          <Button variant="outline">Generate Report</Button>
        </CardContent>
      </Card>
    </div>
  );
}
