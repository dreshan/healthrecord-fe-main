const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const fileUploadService = {
  async uploadHealthRecord(file: File): Promise<string> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.fileUrl;
  },

  async downloadFile(fileUrl: string): Promise<void> {
    window.open(fileUrl, '_blank');
  },

  async deleteFile(fileUrl: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Not authenticated');

    const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

    const response = await fetch(`${API_BASE_URL}/files/${fileName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  },

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = ['application/pdf'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only PDF files are allowed' };
    }

    return { valid: true };
  }
};