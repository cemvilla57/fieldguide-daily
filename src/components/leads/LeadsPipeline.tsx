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
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Lead {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  project_description?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'closed_won' | 'closed_lost';
  assigned_to?: string;
  follow_up_date?: string;
  estimated_value?: number;
  created_at: string;
}

interface CreateLeadData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  project_description: string;
  estimated_value: string;
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-purple-100 text-purple-800',
  qualified: 'bg-indigo-100 text-indigo-800',
  proposal_sent: 'bg-amber-100 text-amber-800',
  negotiation: 'bg-orange-100 text-orange-800',
  closed_won: 'bg-green-100 text-green-800',
  closed_lost: 'bg-red-100 text-red-800',
};

const statusOrder = [
  'new',
  'contacted',
  'qualified',
  'proposal_sent',
  'negotiation',
  'closed_won',
  'closed_lost',
];

export function LeadsPipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<CreateLeadData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    project_description: '',
    estimated_value: '',
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();

      if (data.success) {
        setLeads(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          project_description: formData.project_description,
          estimated_value: formData.estimated_value
            ? parseFloat(formData.estimated_value)
            : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLeads([data.data, ...leads]);
        setFormData({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          project_description: '',
          estimated_value: '',
        });
        setShowCreateDialog(false);
      }
    } catch (error) {
      console.error('Failed to create lead:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLeads(leads.filter((l) => l.id !== leadId));
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  const handleStatusChange = async (
    leadId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setLeads(
          leads.map((l) =>
            l.id === leadId
              ? { ...l, status: newStatus as Lead['status'] }
              : l
          )
        );
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
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

  // Calculate pipeline metrics
  const totalValue = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  const wonValue = leads
    .filter((l) => l.status === 'closed_won')
    .reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  const activeLeads = leads.filter(
    (l) => !['closed_won', 'closed_lost'].includes(l.status)
  );

  // Group leads by status
  const leadsByStatus = statusOrder.reduce(
    (acc, status) => {
      acc[status] = leads.filter((l) => l.status === status);
      return acc;
    },
    {} as Record<string, Lead[]>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline</h2>
          <p className="text-gray-600 mt-1">
            Track opportunities and manage your sales funnel
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Lead
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">All estimated values</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won This Period</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${wonValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">Closed deals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLeads.length}</div>
            <p className="text-xs text-gray-600 mt-1">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 overflow-x-auto pb-4">
        {statusOrder.map((status) => (
          <div key={status} className="min-w-80 lg:min-w-0">
            <div className="bg-gray-50 rounded-lg p-4 min-h-96">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 capitalize">
                  {status.replace(/_/g, ' ')}
                </h3>
                <Badge className="bg-gray-200 text-gray-800">
                  {leadsByStatus[status].length}
                </Badge>
              </div>

              <div className="space-y-3">
                {leadsByStatus[status].map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {lead.customer_name}
                      </h4>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    {lead.customer_email && (
                      <p className="text-xs text-gray-600 mb-1">
                        {lead.customer_email}
                      </p>
                    )}

                    {lead.estimated_value && (
                      <p className="text-sm font-semibold text-indigo-600 mb-2">
                        ${lead.estimated_value.toLocaleString()}
                      </p>
                    )}

                    {lead.project_description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {lead.project_description}
                      </p>
                    )}

                    {lead.follow_up_date && (
                      <p className="text-xs text-amber-600 mb-2">
                        Follow up {formatDistanceToNow(new Date(lead.follow_up_date), { addSuffix: true })}
                      </p>
                    )}

                    <Select
                      value={status}
                      onValueChange={(value) =>
                        handleStatusChange(lead.id, value)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOrder.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Lead Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Lead</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <form onSubmit={handleCreateLead} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Customer Name *</label>
              <Input
                placeholder="John Smith"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                required
                disabled={creating}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.customer_email}
                onChange={(e) =>
                  setFormData({ ...formData, customer_email: e.target.value })
                }
                disabled={creating}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                placeholder="(555) 123-4567"
                value={formData.customer_phone}
                onChange={(e) =>
                  setFormData({ ...formData, customer_phone: e.target.value })
                }
                disabled={creating}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Project Description</label>
              <Textarea
                placeholder="Brief description of the project..."
                value={formData.project_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    project_description: e.target.value,
                  })
                }
                rows={3}
                disabled={creating}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Estimated Value</label>
              <Input
                placeholder="0.00"
                type="number"
                step="0.01"
                value={formData.estimated_value}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_value: e.target.value })
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
              <Button
                type="submit"
                disabled={creating || !formData.customer_name}
              >
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Lead
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
