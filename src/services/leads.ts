import { supabase } from '@/lib/supabase';
import { Lead, LeadStatus } from '@/types/models';
import { CreateLeadInput, UpdateLeadInput } from '@/lib/validation';

/**
 * Leads Service - Sales and business lead management
 */

/**
 * Get all leads for organization
 */
export async function getLeads(
  organizationId: string,
  {
    page = 1,
    pageSize = 20,
    status,
    assignedTo,
  }: {
    page?: number;
    pageSize?: number;
    status?: LeadStatus;
    assignedTo?: string;
  } = {}
) {
  let query = supabase
    .from('leads')
    .select('*, assigned_user:users!assigned_to(*)', { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (assignedTo) {
    query = query.eq('assigned_to', assignedTo);
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }

  return {
    data: (data as any[]) || [],
    total: count || 0,
    page,
    pageSize,
  };
}

/**
 * Get lead by ID
 */
export async function getLeadById(
  leadId: string,
  organizationId: string
): Promise<Lead | null> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .eq('organization_id', organizationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch lead: ${error.message}`);
  }

  return data as Lead;
}

/**
 * Create new lead
 */
export async function createLead(
  organizationId: string,
  input: CreateLeadInput
): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      organization_id: organizationId,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      project_description: input.projectDescription,
      status: input.status,
      assigned_to: input.assignedTo,
      follow_up_date: input.followUpDate,
      estimated_value: input.estimatedValue,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create lead: ${error.message}`);
  }

  return data as Lead;
}

/**
 * Update lead
 */
export async function updateLead(
  leadId: string,
  organizationId: string,
  input: UpdateLeadInput
): Promise<Lead> {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.customerName) updateData.customer_name = input.customerName;
  if (input.customerEmail) updateData.customer_email = input.customerEmail;
  if (input.customerPhone) updateData.customer_phone = input.customerPhone;
  if (input.projectDescription)
    updateData.project_description = input.projectDescription;
  if (input.status) updateData.status = input.status;
  if (input.assignedTo !== undefined) updateData.assigned_to = input.assignedTo;
  if (input.followUpDate) updateData.follow_up_date = input.followUpDate;
  if (input.estimatedValue !== undefined)
    updateData.estimated_value = input.estimatedValue;

  const { data, error } = await supabase
    .from('leads')
    .update(updateData)
    .eq('id', leadId)
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update lead: ${error.message}`);
  }

  return data as Lead;
}

/**
 * Get leads requiring follow-up
 */
export async function getFollowUpLeads(
  organizationId: string,
  { page = 1, pageSize = 10 } = {}
) {
  const now = new Date().toISOString();
  const from = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from('leads')
    .select('*, assigned_user:users!assigned_to(*)', { count: 'exact' })
    .eq('organization_id', organizationId)
    .not('follow_up_date', 'is', null)
    .lte('follow_up_date', now)
    .order('follow_up_date', { ascending: true })
    .range(from, from + pageSize - 1);

  if (error) {
    throw new Error(`Failed to fetch follow-up leads: ${error.message}`);
  }

  return {
    data: (data as any[]) || [],
    total: count || 0,
    page,
    pageSize,
  };
}

/**
 * Get leads pipeline summary
 */
export async function getLeadsPipeline(organizationId: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('status, estimated_value')
    .eq('organization_id', organizationId);

  if (error) {
    throw new Error(`Failed to fetch leads pipeline: ${error.message}`);
  }

  const leads = data || [];
  const pipeline = {
    new: { count: 0, value: 0 },
    contacted: { count: 0, value: 0 },
    qualified: { count: 0, value: 0 },
    proposal_sent: { count: 0, value: 0 },
    negotiation: { count: 0, value: 0 },
    closed_won: { count: 0, value: 0 },
    closed_lost: { count: 0, value: 0 },
  };

  leads.forEach((lead) => {
    const status = lead.status as LeadStatus;
    if (status in pipeline) {
      pipeline[status].count += 1;
      pipeline[status].value += lead.estimated_value || 0;
    }
  });

  return pipeline;
}
