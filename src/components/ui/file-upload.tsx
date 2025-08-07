import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  bucket: string;
  path?: string;
  accept?: string;
  maxSize?: number; // in MB
  onUpload?: (url: string) => void;
  currentImage?: string;
  className?: string;
  label?: string;
}

export function FileUpload({
  bucket,
  path = '',
  accept = 'image/*',
  maxSize = 5,
  onUpload,
  currentImage,
  className,
  label = 'Upload Image'
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size should be less than ${maxSize}MB`);
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      onUpload?.(publicUrl);

      toast({
        title: "Upload successful",
        description: "Image uploaded successfully.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onUpload?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      
      {preview ? (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-24 h-24 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
            <Image className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <Input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id={`file-upload-${bucket}`}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Choose Image'}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Max size: {maxSize}MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}