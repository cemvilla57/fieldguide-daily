import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  uploadPhoto as uploadPhotoService,
  getUpdatePhotos,
  deletePhoto as deletePhotoService,
  updatePhotoCaption as updatePhotoCaptionService,
} from '@/services/photos';

/**
 * POST /api/updates/[id]/photos
 * Upload photo to daily update
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string | undefined;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const photo = await uploadPhotoService(
      user.organization_id,
      params.id,
      projectId,
      file,
      caption,
      user.id
    );

    return NextResponse.json(
      { success: true, data: photo },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/updates/[id]/photos
 * Get all photos for daily update
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const photos = await getUpdatePhotos(params.id, user.organization_id, {
      page,
      pageSize,
    });

    return NextResponse.json({
      success: true,
      data: photos.data,
      pagination: {
        page: photos.page,
        pageSize: photos.pageSize,
        total: photos.total,
        totalPages: Math.ceil(photos.total / photos.pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
