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
import { Loader2, Download, Trash2, Edit2, ZoomIn, X } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  caption?: string;
  taken_at: string;
  uploaded_by?: string;
  storage_provider: 'supabase' | 'box';
}

interface PhotoGalleryProps {
  updateId: string;
  projectId: string;
  readOnly?: boolean;
}

export function PhotoGallery({
  updateId,
  projectId,
  readOnly = false,
}: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [editingCaption, setEditingCaption] = useState<{
    photoId: string;
    caption: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [updateId]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/updates/${updateId}/photos`);
      const data = await response.json();

      if (data.success) {
        setPhotos(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPhotos(photos.filter((p) => p.id !== photoId));
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  const handleUpdateCaption = async () => {
    if (!editingCaption) return;

    try {
      const response = await fetch(`/api/photos/${editingCaption.photoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: editingCaption.caption }),
      });

      if (response.ok) {
        setPhotos(
          photos.map((p) =>
            p.id === editingCaption.photoId
              ? { ...p, caption: editingCaption.caption }
              : p
          )
        );
        setEditingCaption(null);
      }
    } catch (error) {
      console.error('Failed to update caption:', error);
    }
  };

  const handleDownloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `photo-${photo.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Photo Documentation ({photos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No photos uploaded yet
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group rounded-lg overflow-hidden bg-gray-100"
                >
                  {/* Image */}
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Photo'}
                    className="w-full h-48 object-cover group-hover:opacity-75 transition"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedPhoto(photo)}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition"
                      title="View full size"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadPhoto(photo)}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {!readOnly && (
                      <>
                        <button
                          onClick={() =>
                            setEditingCaption({
                              photoId: photo.id,
                              caption: photo.caption || '',
                            })
                          }
                          className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition"
                          title="Edit caption"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Caption Badge */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                    {photo.caption && (
                      <p className="text-white text-xs line-clamp-2">
                        {photo.caption}
                      </p>
                    )}
                    <Badge variant="secondary" className="text-xs mt-1">
                      {photo.storage_provider === 'box' ? '📦 Box' : '☁️ Cloud'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Size Photo Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Photo View</DialogTitle>
            <DialogClose />
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || 'Photo'}
                className="w-full rounded-lg"
              />
              {selectedPhoto.caption && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Caption</p>
                  <p className="text-gray-900">{selectedPhoto.caption}</p>
                </div>
              )}
              <div className="text-sm text-gray-500">
                Stored in{' '}
                <Badge variant="outline">
                  {selectedPhoto.storage_provider === 'box'
                    ? 'Box'
                    : 'Supabase'}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Caption Dialog */}
      <Dialog
        open={!!editingCaption}
        onOpenChange={() => setEditingCaption(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Photo Caption</DialogTitle>
            <DialogClose />
          </DialogHeader>
          {editingCaption && (
            <div className="space-y-4">
              <Input
                placeholder="Enter photo caption..."
                value={editingCaption.caption}
                onChange={(e) =>
                  setEditingCaption({
                    ...editingCaption,
                    caption: e.target.value,
                  })
                }
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEditingCaption(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateCaption}>
                  Save Caption
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
