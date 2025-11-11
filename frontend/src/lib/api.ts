import { Form } from '@/types/form';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }
  const data = await response.json();
  // Convert MongoDB _id to id for frontend compatibility
  if (Array.isArray(data)) {
    return data.map(item => ({ ...item, id: item._id || item.id }));
  } else if (data && data._id) {
    return { ...data, id: data._id };
  }
  return data;
};

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export const api = {
  // Auth API calls
  auth: {
    register: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },
  },

  // Admin API calls
  admin: {
    // Get all forms
    getForms: async (): Promise<Form[]> => {
      const response = await fetch(`${API_BASE_URL}/admin/forms`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    // Get form by ID
    getForm: async (id: string): Promise<Form> => {
      const response = await fetch(`${API_BASE_URL}/admin/forms/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },

    // Create new form
    createForm: async (formData: Omit<Form, '_id' | 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Form> => {
      const response = await fetch(`${API_BASE_URL}/admin/forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(formData),
      });
      return handleResponse(response);
    },

    // Update form
    updateForm: async (id: string, formData: Partial<Omit<Form, '_id' | 'id'>>): Promise<Form> => {
      const response = await fetch(`${API_BASE_URL}/admin/forms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(formData),
      });
      return handleResponse(response);
    },

    // Delete form
    deleteForm: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/admin/forms/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new ApiError(response.status, error.error || 'Delete failed');
      }
    },

    // Get form submissions with filters
    getSubmissions: async (formId: string, params: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      search?: string;
      version?: number;
    } = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`${API_BASE_URL}/admin/forms/${formId}/submissions?${queryParams}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },

  // File upload
  upload: {
    // Upload file (admin)
    uploadFile: async (file: File): Promise<{ url: string; filename: string; size: number }> => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });
      return handleResponse(response);
    },

    // Upload file (public)
    uploadFilePublic: async (file: File): Promise<{ url: string; filename: string; size: number }> => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      return handleResponse(response);
    },
  },

  // Public API calls
  public: {
    // Get public form
    getForm: async (id: string): Promise<Form> => {
      const response = await fetch(`${API_BASE_URL}/forms/${id}`);
      return handleResponse(response);
    },

    // Submit form
    submitForm: async (formId: string, answers: Record<string, any>): Promise<{ id: string }> => {
      const response = await fetch(`${API_BASE_URL}/forms/${formId}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });
      return handleResponse(response);
    },
  },
};

export { ApiError };