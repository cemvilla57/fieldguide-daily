import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createDailyUpdate as createUpdateService,
  getDailyUpdateById,
  getProjectDailyUpdates,
  getPendingApprovals,
  approveDailyUpdate as approveDailyUpdateService,
  rejectDailyUpdate as rejectDailyUpdateService,
} from '@/services/updates';
import { analyzeUpdate } from '@/services/ai';
import { CreateDailyUpdateSchema } from '@/lib/validation';

/**
 * GET /api/updates
 * Get user's daily updates
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      );
    }

    const updates = await getProjectDailyUpdates(
      projectId,
      user.organization_id,
      { page, pageSize }
    );

    return NextResponse.json({
      success: true,
      data: updates.data,
      pagination: {
        page: updates.page,
        pageSize: updates.pageSize,
        total: updates.total,
        totalPages: Math.ceil(updates.total / updates.pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching updates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch updates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/updates
 * Create new daily update
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const input = CreateDailyUpdateSchema.parse(body);

    const update = await createUpdateService(
      user.organization_id,
      user.id,
      input
    );

    return NextResponse.json(
      { success: true, data: update },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create update' },
      { status: 400 }
    );
  }
}
