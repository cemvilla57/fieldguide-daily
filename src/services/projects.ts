import { supabase } from '@/lib/supabase';
import { Project, ProjectStatus } from '@/types/models';
import { CreateProjectInput, UpdateProjectInput } from '@/lib/validation';

/**
 * Projects Service - All project-related database operations
 */

/**
 * Get all projects for current organization
 */
export async function getProjects(
  organizationId: string,
  {
    page = 1,
    pageSize = 10,
    status,
  }: { page?: number; pageSize?: number; status?: ProjectStatus } = {}
) {
  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return {
    data: (data as Project[]) || [],
    total: count || 0,
    page,
    pageSize,
  };
}

/**
 * Get single project by ID
 */
export async function getProjectById(
  projectId: string,
  organizationId: string
): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('organization_id', organizationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch project: ${error.message}`);
  }

  return data as Project;
}

/**
 * Create new project
 */
export async function createProject(
  organizationId: string,
  userId: string,
  input: CreateProjectInput
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      organization_id: organizationId,
      name: input.name,
      description: input.description,
      status: input.status,
      start_date: input.startDate,
      end_date: input.endDate,
      location: input.location,
      budget: input.budget,
      manager_id: userId,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return data as Project;
}

/**
 * Update project
 */
export async function updateProject(
  projectId: string,
  organizationId: string,
  input: UpdateProjectInput
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...(input.name && { name: input.name }),
      ...(input.description && { description: input.description }),
      ...(input.status && { status: input.status }),
      ...(input.startDate && { start_date: input.startDate }),
      ...(input.endDate && { end_date: input.endDate }),
      ...(input.location && { location: input.location }),
      ...(input.budget !== undefined && { budget: input.budget }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  return data as Project;
}

/**
 * Delete project (soft delete - archive)
 */
export async function deleteProject(
  projectId: string,
  organizationId: string
): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ status: 'archived' })
    .eq('id', projectId)
    .eq('organization_id', organizationId);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }
}

/**
 * Get project statistics
 */
export async function getProjectStats(
  projectId: string,
  organizationId: string
) {
  try {
    // Get task statistics
    const { data: tasks } = await supabase
      .from('tasks')
      .select('status')
      .eq('project_id', projectId)
      .eq('organization_id', organizationId);

    // Get milestone statistics
    const { data: milestones } = await supabase
      .from('milestones')
      .select('percentage_complete')
      .eq('project_id', projectId)
      .eq('organization_id', organizationId);

    // Get recent updates count
    const { count: updatesCount } = await supabase
      .from('daily_updates')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .eq('organization_id', organizationId);

    const taskStats = {
      total: tasks?.length || 0,
      completed: tasks?.filter((t) => t.status === 'completed').length || 0,
      inProgress: tasks?.filter((t) => t.status === 'in_progress').length || 0,
      open: tasks?.filter((t) => t.status === 'open').length || 0,
      blocked: tasks?.filter((t) => t.status === 'blocked').length || 0,
    };

    const avgMilestoneProgress =
      milestones && milestones.length > 0
        ? milestones.reduce((sum, m) => sum + m.percentage_complete, 0) /
          milestones.length
        : 0;

    return {
      taskStats,
      milestoneProgress: Math.round(avgMilestoneProgress),
      totalUpdates: updatesCount || 0,
    };
  } catch (error) {
    console.error('Error fetching project stats:', error);
    throw error;
  }
}
