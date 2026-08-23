import { z } from 'zod';

/**
 * User Roles
 * Hierarchy: Admin > Project Manager > Supervisor > Crew Lead > Technician, Customer
 */
export enum UserRole {
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  SUPERVISOR = 'supervisor',
  CREW_LEAD = 'crew_lead',
  TECHNICIAN = 'technician',
  CUSTOMER = 'customer',
}

/**
 * Project Status
 */
export enum ProjectStatus {
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

/**
 * Daily Update Status
 */
export enum UpdateStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Task Status
 */
export enum TaskStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled',
}

/**
 * Task Priority
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Milestone Status
 */
export enum MilestoneStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
}

/**
 * Lead Status
 */
export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL_SENT = 'proposal_sent',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

/**
 * Report Type
 */
export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  PROJECT = 'project',
}

/**
 * AI Analysis Status
 */
export enum AIAnalysisStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PENDING_APPROVAL = 'pending_approval',
}

/**
 * Audit Action Types
 */
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
}

// Database Models

/**
 * Organization - Multi-tenant support
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

/**
 * User Profile
 */
export interface User {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Project
 */
export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  start_date: string;
  end_date?: string;
  location?: string;
  budget?: number;
  manager_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Daily Update
 */
export interface DailyUpdate {
  id: string;
  organization_id: string;
  project_id: string;
  user_id: string;
  date: string;
  text_content?: string;
  status: UpdateStatus;
  voice_note_url?: string;
  voice_duration_seconds?: number;
  ai_analysis_id?: string;
  supervisor_id?: string;
  approved_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
}

/**
 * AI Analysis - Draft analysis pending approval
 */
export interface AIAnalysis {
  id: string;
  organization_id: string;
  daily_update_id: string;
  status: AIAnalysisStatus;
  completed_work: string[];
  planned_work: string[];
  tasks_needed: string[];
  materials_needed: string[];
  identified_risks: string[];
  possible_change_orders: string[];
  customer_update: string;
  management_summary: string;
  confidence_score?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Task
 */
export interface Task {
  id: string;
  organization_id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: string;
  created_by: string;
  daily_update_id?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Milestone
 */
export interface Milestone {
  id: string;
  organization_id: string;
  project_id: string;
  name: string;
  description?: string;
  status: MilestoneStatus;
  planned_date: string;
  actual_date?: string;
  percentage_complete: number;
  created_at: string;
  updated_at: string;
}

/**
 * Lead
 */
export interface Lead {
  id: string;
  organization_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  project_description?: string;
  status: LeadStatus;
  assigned_to?: string;
  follow_up_date?: string;
  estimated_value?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Photo
 */
export interface Photo {
  id: string;
  organization_id: string;
  daily_update_id?: string;
  project_id: string;
  url: string;
  storage_path: string;
  caption?: string;
  taken_at: string;
  uploaded_by: string;
  created_at: string;
  storage_provider?: string;
  box_file_id?: string;
}

/**
 * Report
 */
export interface Report {
  id: string;
  organization_id: string;
  project_id?: string;
  report_type: ReportType;
  report_date: string;
  generated_by: string;
  content: string;
  exported_at?: string;
  created_at: string;
}

/**
 * Audit Log
 */
export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  changes?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

/**
 * Material
 */
export interface Material {
  id: string;
  organization_id: string;
  daily_update_id: string;
  project_id: string;
  name: string;
  quantity?: number;
  unit?: string;
  cost?: number;
  supplier?: string;
  created_at: string;
}

/**
 * Risk
 */
export interface Risk {
  id: string;
  organization_id: string;
  daily_update_id: string;
  project_id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation_plan?: string;
  created_at: string;
}

/**
 * Change Order
 */
export interface ChangeOrder {
  id: string;
  organization_id: string;
  project_id: string;
  daily_update_id: string;
  description: string;
  estimated_cost?: number;
  status: 'proposed' | 'approved' | 'rejected';
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * API Response Types
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
