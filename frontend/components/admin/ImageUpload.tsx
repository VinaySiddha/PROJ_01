/**
 * @file ImageUpload — drag-and-drop or click-to-upload image component for admin pages
 * @module components/admin/ImageUpload
 */
'use client';

import { useRef, useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '../../lib/api';

interface ImageUploadProps {
  /** Current image URL(s) */
  value: string[];
  /** Called when the images array changes */
  onChange: (urls: string[]) => void;
  /** Max number of images (default 5) */
  max?: number;
  /** Cloudinary folder to upload into */
  folder?: string;
}

export function ImageUpload({ value, onChange, max = 5, folder = 'themagicscreen/theaters' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = max - value.length;
    const toUpload = files.slice(0, remaining);

    setUploading(true);
    setError(null);

    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        // Convert file to base64 data URL
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await apiClient.post<{ data: { url: string } }>('/admin/upload', {
          data: base64,
          folder,
        });
        uploaded.push(res.data.data.url);
      }
      onChange([...value, ...uploaded]);
    } catch {
      setError('Upload failed. Check your Cloudinary settings and try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const canUpload = value.length < max && !uploading;

  return (
    <div className="space-y-3">
      {/* Thumbnail grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((url, i) => (
            <div key={url} className="relative group aspect-video rounded-xl overflow-hidden border border-white/10 bg-[#111]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Image ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X size={10} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#D4A017] text-black">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {canUpload && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-dashed border-white/20 text-[#888] hover:text-white hover:border-[#D4A017]/50 hover:bg-[#D4A017]/5 transition-all text-sm"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin text-[#D4A017]" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                {value.length === 0 ? 'Upload Image' : `Add More (${value.length}/${max})`}
                <span className="text-xs text-[#555]">JPG, PNG, WebP · max 4 MB</span>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={max > 1}
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}

      {value.length === 0 && !canUpload && (
        <div className="flex items-center gap-2 text-xs text-[#555]">
          <ImageIcon size={14} />
          No images uploaded yet.
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
