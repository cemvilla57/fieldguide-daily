import { supabase } from '@/lib/supabase';
import { Photo } from '@/types/models';
import axios from 'axios';

/**
 * Photos Service - Photo upload and management
 * Supports both Supabase Storage and Box storage
 */

const BOX_API_URL = 'https://api.box.com/2.0';
const BOX_FOLDER_IDS = {
  root: process.env.BOX_ROOT_FOLDER_ID || '0',
};

/**
 * Get Box access token
 */
async function getBoxAccessToken(): Promise<string> {
  const boxClientId = process.env.BOX_CLIENT_ID;
  const boxClientSecret = process.env.BOX_CLIENT_SECRET;
  const boxEnterpriseId = process.env.BOX_ENTERPRISE_ID;

  if (!boxClientId || !boxClientSecret || !boxEnterpriseId) {
    throw new Error('Box configuration is missing');
  }

  try {
    const response = await axios.post(
      'https://api.box.com/oauth2/token',
      {
        grant_type: 'client_credentials',
        client_id: boxClientId,
        client_secret: boxClientSecret,
        box_subject_type: 'enterprise',
        box_subject_id: boxEnterpriseId,
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Box access token:', error);
    throw new Error('Failed to authenticate with Box');
  }
}

/**
 * Get or create folder in Box
 */
async function getOrCreateBoxFolder(
  parentFolderId: string,
  folderName: string,
  accessToken: string
): Promise<string> {
  try {
    // List folders in parent
    const listResponse = await axios.get(
      `${BOX_API_URL}/folders/${parentFolderId}/items`,
      {
        params: { fields: 'id,name,type' },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // Check if folder exists
    const existingFolder = listResponse.data.entries?.find(
      (item: any) => item.type === 'folder' && item.name === folderName
    );

    if (existingFolder) {
      return existingFolder.id;
    }

    // Create new folder
    const createResponse = await axios.post(
      `${BOX_API_URL}/folders`,
      {
        name: folderName,
        parent: { id: parentFolderId },
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return createResponse.data.id;
  } catch (error) {
    console.error('Error managing Box folder:', error);
    throw error;
  }
}

/**
 * Upload photo to Box
 */
async function uploadPhotoToBox(
  organizationId: string,
  projectId: string,
  dailyUpdateId: string,
  file: File,
  accessToken: string
): Promise<{ fileId: string; webUrl: string }> {
  try {
    // Create folder structure: organization -> project -> update
    const orgFolder = await getOrCreateBoxFolder(
      BOX_FOLDER_IDS.root,
      organizationId,
      accessToken
    );

    const projectFolder = await getOrCreateBoxFolder(
      orgFolder,
      projectId,
      accessToken
    );

    const updateFolder = await getOrCreateBoxFolder(
      projectFolder,
      dailyUpdateId,
      accessToken
    );

    // Upload file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parent', JSON.stringify({ id: updateFolder }));

    const uploadResponse = await axios.post(
      `${BOX_API_URL}/files/content`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const fileId = uploadResponse.data.entries[0].id;
    const fileName = uploadResponse.data.entries[0].name;

    // Get shared link
    const linkResponse = await axios.put(
      `${BOX_API_URL}/files/${fileId}`,
      {
        shared_link: {
          access: 'open',
          permissions: {
            can_download: true,
            can_preview: true,
          },
        },
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const webUrl = linkResponse.data.shared_link?.url || '';

    return { fileId, webUrl };
  } catch (error) {
    console.error('Error uploading to Box:', error);
    throw error;
  }
}

/**
 * Upload photo to Supabase Storage
 */
async function uploadPhotoToSupabase(
  organizationId: string,
  projectId: string,
  dailyUpdateId: string,
  file: File
): Promise<{ url: string; storagePath: string }> {
  // Generate unique file path
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const fileExtension = file.name.split('.').pop();
  const fileName = `${timestamp}-${random}.${fileExtension}`;
  const storagePath = `${organizationId}/${projectId}/${dailyUpdateId}/${fileName}`;

  // Upload file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('project-photos')
    .upload(storagePath, file);

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('project-photos').getPublicUrl(storagePath);

  return { url: publicUrl, storagePath };
}

/**
 * Upload photo - supports both Box and Supabase
 */
export async function uploadPhoto(
  organizationId: string,
  dailyUpdateId: string,
  projectId: string,
  file: File,
  caption?: string,
  userId?: string,
  storageProvider: 'box' | 'supabase' = 'supabase'
): Promise<Photo> {
  try {
    let photoUrl: string;
    let storagePath: string;
    let boxFileId: string | null = null;

    if (storageProvider === 'box' && process.env.BOX_CLIENT_ID) {
      // Upload to Box
      const boxToken = await getBoxAccessToken();
      const boxResult = await uploadPhotoToBox(
        organizationId,
        projectId,
        dailyUpdateId,
        file,
        boxToken
      );
      photoUrl = boxResult.webUrl;
      storagePath = boxResult.fileId;
      boxFileId = boxResult.fileId;
    } else {
      // Upload to Supabase (default)
      const supabaseResult = await uploadPhotoToSupabase(
        organizationId,
        projectId,
        dailyUpdateId,
        file
      );
      photoUrl = supabaseResult.url;
      storagePath = supabaseResult.storagePath;
    }

    // Create photo record in database
    const { data, error } = await supabase
      .from('photos')
      .insert({
        organization_id: organizationId,
        daily_update_id: dailyUpdateId,
        project_id: projectId,
        url: photoUrl,
        storage_path: storagePath,
        box_file_id: boxFileId,
        storage_provider: storageProvider,
        caption,
        taken_at: new Date().toISOString(),
        uploaded_by: userId,
      })
      .select()
      .single();

    if (error) {
      // Clean up uploaded file if database insert fails
      if (storageProvider === 'supabase') {
        await supabase.storage
          .from('project-photos')
          .remove([storagePath]);
      }
      throw new Error(`Failed to save photo record: ${error.message}`);
    }

    return data as Photo;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}

/**
 * Get photos for daily update
 */
export async function getUpdatePhotos(
  dailyUpdateId: string,
  organizationId: string,
  { page = 1, pageSize = 20 } = {}
) {
  const from = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from('photos')
    .select('*, uploader:users!uploaded_by(*)', { count: 'exact' })
    .eq('daily_update_id', dailyUpdateId)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) {
    throw new Error(`Failed to fetch photos: ${error.message}`);
  }

  return {
    data: (data as any[]) || [],
    total: count || 0,
    page,
    pageSize,
  };
}

/**
 * Get photos for project
 */
export async function getProjectPhotos(
  projectId: string,
  organizationId: string,
  { page = 1, pageSize = 50 } = {}
) {
  const from = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from('photos')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) {
    throw new Error(`Failed to fetch project photos: ${error.message}`);
  }

  return {
    data: (data as Photo[]) || [],
    total: count || 0,
    page,
    pageSize,
  };
}

/**
 * Get photo by ID
 */
export async function getPhotoById(
  photoId: string,
  organizationId: string
): Promise<Photo | null> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('id', photoId)
    .eq('organization_id', organizationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch photo: ${error.message}`);
  }

  return data as Photo;
}

/**
 * Update photo caption
 */
export async function updatePhotoCaption(
  photoId: string,
  organizationId: string,
  caption: string
): Promise<Photo> {
  const { data, error } = await supabase
    .from('photos')
    .update({ caption })
    .eq('id', photoId)
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update photo: ${error.message}`);
  }

  return data as Photo;
}

/**
 * Delete photo from Box
 */
async function deletePhotoFromBox(
  boxFileId: string,
  accessToken: string
): Promise<void> {
  try {
    await axios.delete(
      `${BOX_API_URL}/files/${boxFileId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  } catch (error) {
    console.error('Error deleting from Box:', error);
    throw error;
  }
}

/**
 * Delete photo
 */
export async function deletePhoto(
  photoId: string,
  organizationId: string
): Promise<void> {
  try {
    // Get photo to retrieve storage path and provider
    const photo = await getPhotoById(photoId, organizationId);
    if (!photo) {
      throw new Error('Photo not found');
    }

    // Delete from appropriate storage provider
    if (photo.storage_provider === 'box' && photo.box_file_id) {
      const boxToken = await getBoxAccessToken();
      await deletePhotoFromBox(photo.box_file_id, boxToken);
    } else {
      // Delete from Supabase storage
      await supabase.storage
        .from('project-photos')
        .remove([photo.storage_path]);
    }

    // Delete from database
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)
      .eq('organization_id', organizationId);

    if (error) {
      throw new Error(`Failed to delete photo: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
}
