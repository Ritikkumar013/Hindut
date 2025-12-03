export interface Video {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  downloadUrl: string;
  uploadedAt: Date;
  fileName: string;
  fileSize: number;
}

export interface VideoUploadProgress {
  progress: number;
  state: 'uploading' | 'paused' | 'success' | 'error';
  error?: string;
}
