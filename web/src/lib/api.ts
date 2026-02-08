import { getSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// Types
export interface Business {
  _id?: string;
  name: string;
  taxId?: string;
  address?: string;
  status?: string;
  revenue?: string;
  created?: string;
  ownerId?: string;
}

export interface Document {
  _id?: string;
  name: string;
  size: number;
  url?: string;
  key?: string;
  uploaded?: string;
  access?: string;
  businessId?: string;
  fileType: string;
  ownerId?: string;
}

export interface ApiKey {
  _id?: string;
  name: string;
  key?: string;
  created?: string;
  status?: string;
  userId?: string;
}

// Store token globally to avoid repeated session calls
let cachedToken: string | null = null;
let tokenFetchTime: number = 0;
const TOKEN_CACHE_TIME = 60000; // 1 minute cache

// Helper to get auth token
async function getAuthToken(): Promise<string | null> {
  // Return cached token if still valid
  const now = Date.now();
  if (cachedToken && now - tokenFetchTime < TOKEN_CACHE_TIME) {
    return cachedToken;
  }

  try {
    const session = await getSession();
    
    console.log('Debug - Session data:', {
      hasSession: !!session,
      sessionKeys: session ? Object.keys(session) : [],
      user: session?.user,
      accessToken: session?.accessToken,
      hasUserId: !!session?.user?.id
    });

    if (session?.accessToken) {
      cachedToken = session.accessToken;
      tokenFetchTime = now;
      return session.accessToken;
    }

    if (session?.user?.id) {
      // Fallback: use user.id as token if no accessToken
      cachedToken = session.user.id;
      tokenFetchTime = now;
      return session.user.id;
    }

    console.warn('No auth token found in session');
    cachedToken = null;
    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    cachedToken = null;
    return null;
  }
}

// Auth fetch wrapper
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  // Create headers object
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge custom headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        headers[key] = String(value);
      }
    });
  }

  // Add auth header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Check if we're on client side and can redirect
    if (typeof window !== 'undefined') {
      console.error('No auth token available, redirecting to login...');
      window.location.href = '/login';
      throw new Error('Redirecting to login...');
    }
    throw new Error('Authentication required. Please log in.');
  }

  console.log('API Request details:', {
    endpoint: `${API_BASE}${endpoint}`,
    method: options.method || 'GET',
    hasToken: !!token,
    tokenLength: token?.length
  });

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    // Handle 401 - token expired
    if (response.status === 401) {
      // Clear cache
      cachedToken = null;
      tokenFetchTime = 0;
      
      // Try to get error message
      let errorMessage = 'Session expired. Please log in again.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Use default message
      }
      
      // Redirect to login on client side
      if (typeof window !== 'undefined') {
        console.log('Token expired, redirecting to login...');
        window.location.href = '/login?error=session_expired';
      }
      
      throw new Error(`HTTP 401: ${errorMessage}`);
    }

    // Handle other errors
    if (!response.ok) {
      try {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      } catch (jsonError) {
        const statusText = response.statusText || 'Unknown Error';
        throw new Error(`HTTP ${response.status}: ${statusText}`);
      }
    }

    // Parse response
    try {
      return await response.json();
    } catch (parseError) {
      try {
        const text = await response.text();
        return text ? { data: text } : {};
      } catch {
        return {};
      }
    }
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    
    if (error instanceof Error) {
      // Don't throw redirect errors
      if (!error.message.includes('Redirecting to login')) {
        throw error;
      }
    }
    throw new Error('Network request failed');
  }
}

// Business APIs
export const businessApi = {
  create: async (data: Business) => {
    return fetchWithAuth('/business', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  list: async () => {
    return fetchWithAuth('/business');
  },

  get: async (id: string) => {
    return fetchWithAuth(`/business/${id}`);
  },

  update: async (id: string, data: Partial<Business>) => {
    return fetchWithAuth(`/business/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/business/${id}`, {
      method: 'DELETE',
    });
  },
};

// Document APIs
export const documentApi = {
  getUploadUrl: async (fileName: string, fileType: string) => {
    return fetchWithAuth('/documents/upload-url', {
      method: 'POST',
      body: JSON.stringify({ fileName, fileType }),
    });
  },

  uploadToS3: async (uploadUrl: string, file: File) => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response;
  },

  saveMetadata: async (data: Omit<Document, '_id'>) => {
    return fetchWithAuth('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  list: async (businessId?: string) => {
    const url = businessId ? `/documents?businessId=${businessId}` : '/documents';
    return fetchWithAuth(url);
  },

  getDownloadUrl: async (documentId: string) => {
    return fetchWithAuth(`/documents/download/${documentId}`);
  },

  delete: async (documentId: string) => {
    return fetchWithAuth(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  },
};

// API Key Management
export const apiKeyApi = {
  create: async (name: string) => {
    return fetchWithAuth('/keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  list: async () => {
    return fetchWithAuth('/keys');
  },

  revoke: async (keyId: string) => {
    return fetchWithAuth(`/keys?id=${keyId}`, {
      method: 'DELETE',
    });
  },
};

// Helper functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Error handler
export const handleApiError = (error: any): string => {
  if (error instanceof Error) {
    if (error.message.includes('401') || error.message.includes('Authentication') || error.message.includes('Session expired')) {
      return 'Your session has expired. Please log in again.';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Helper to check if user is authenticated
export const checkAuth = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch {
    return false;
  }
};