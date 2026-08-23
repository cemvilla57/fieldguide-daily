'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Plus,
  Edit2,
  Archive,
  Calendar,
  DollarSign,
  Users,
  MapPin,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'on_hold' | 'completed' | 'archived';
  start_date: string;
  end_date?: string;
  location?: string;
  budget?: number;
  manager?: {
    full_name: string;
    email: string;
  };
  created_at: string;
}

interface CreateProjectData {
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  budget: string;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-800',
};

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    location: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    budget: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();

      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProjects([data.data, ...projects]);
        setFormData({
          name: '',
          description: '',
          location: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
          budget: '',
        });
        setShowCreateDialog(false);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to archive this project?')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });

      if (response.ok) {
        setProjects(
          projects.map((p) =>
            p.id === projectId ? { ...p, status: 'archived' } : p
          )
        );
      }
    } catch (error) {
      console.error('Failed to archive project:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  const activeProjects = projects.filter((p) => p.status === 'active');
  const otherProjects = projects.filter((p) => p.status !== 'active');

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600 mt-1">
            Manage and track all your projects
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Active Projects */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Active Projects ({activeProjects.length})
        </h3>
        {activeProjects.length === 0 ? (
          <Card>
            <CardContent className="text-center text-gray-500 py-8">
              No active projects. Create one to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onArchive={handleArchiveProject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Other Projects */}
      {otherProjects.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Other Projects ({otherProjects.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {otherProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onArchive={handleArchiveProject}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Project Name *</label>
              <Input
                placeholder="e.g., Downtown Office Renovation"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={creating}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Brief description of the project..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                disabled={creating}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="Project location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                disabled={creating}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date *</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                  disabled={creating}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  disabled={creating}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Budget</label>
              <Input
                placeholder="0.00"
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                disabled={creating}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating || !formData.name}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onArchive: (projectId: string) => void;
}

function ProjectCard({ project, onArchive }: ProjectCardProps) {
  const daysRunning = project.end_date
    ? Math.ceil(
        (new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : Math.ceil(
        (new Date().getTime() - new Date(project.start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      );

  return (
    <Card className="hover:shadow-lg transition">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg text-gray-900">
              {project.name}
            </CardTitle>
            <Badge className={statusColors[project.status]}>
              {project.status}
            </Badge>
          </div>
          {project.status !== 'archived' && (
            <button
              onClick={() => onArchive(project.id)}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
              title="Archive project"
            >
              <Archive className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          {project.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              {project.location}
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            {formatDistanceToNow(new Date(project.start_date), { addSuffix: true })} • {daysRunning} days
          </div>

          {project.budget && (
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="h-4 w-4" />
              ${project.budget.toLocaleString()}
            </div>
          )}

          {project.manager && (
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              {project.manager.full_name}
            </div>
          )}
        </div>

        <Button variant="outline" className="w-full">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
