/**
 * API Client Configuration
 * Centralized REST API client with error handling and request/response interceptors
 */

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.solextrade.co/api";

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null) {
    this.token = token;
  }

  /**
   * Get authentication token from AsyncStorage or state
   */
  private async getAuthHeaders(isFormData: boolean = false): Promise<HeadersInit> {
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    // Only set Content-Type for JSON, FormData sets it automatically with boundary
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): ApiError {
    // If it's already an ApiError, return it
    if (error.message && error.status !== undefined) {
      return error;
    }

    // Handle fetch errors
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || "An error occurred",
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    } else {
      // Something else happened (network error, JSON parse error, etc.)
      return {
        message: error.message || "An unexpected error occurred",
        status: 0,
      };
    }
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const isFormData = options.body instanceof FormData;
      const headers = await this.getAuthHeaders(isFormData);
      const url = `${this.baseURL}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(isFormData ? {} : options.headers), // Don't override FormData headers
        },
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          } else {
            errorData = { message: await response.text() };
          }
        } catch {
          errorData = { message: "An error occurred" };
        }

        const apiError: ApiError = {
          message:
            errorData.message ||
            errorData.data?.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          status: errorData.code || response.status,
          data: errorData,
        };
        throw apiError;
      }

      const data = await response.json();
      return data as T;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return this.request<T>(`${endpoint}${queryString}`, {
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: "POST",
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
