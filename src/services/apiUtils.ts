
/**
 * Utility functions for API requests
 */

// Base API URL for backend server
export const API_URL = import.meta.env.PROD 
  ? 'https://your-production-api-url.com/api' // Change this to your production API URL
  : 'http://localhost:3000/api';

/**
 * Make a fetch request with timeout and error handling
 */
export const fetchWithTimeout = async (
  url: string, 
  options: RequestInit = {}, 
  timeoutMs: number = 10000 // Increased timeout to 10 seconds
): Promise<Response> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

/**
 * Check if the API is available
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    // Skip health check in production
    if (import.meta.env.PROD) {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        console.log("Skipping API health check in production environment");
        return true;
      }
    }
    
    console.log("Checking API health at:", `${API_URL}/health-check`);
    
    // Thử truy cập với thời gian timeout ngắn hơn (3 giây)
    const response = await fetchWithTimeout(`${API_URL}/health-check`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-cache' // Tránh cache khi kiểm tra sức khỏe API
    }, 3000);
    
    if (response.ok) {
      console.log("API health check successful");
      return true;
    }
    
    const data = await response.json().catch(() => ({ status: 'error' }));
    console.warn("API health check response:", data);
    return false;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
};

/**
 * Handle API response
 */
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    try {
      // Try to parse as JSON
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `API error: ${response.status}`);
    } catch (e) {
      // If parsing fails, use the text directly
      throw new Error(`API error: ${response.status} - ${errorText || 'Unknown error'}`);
    }
  }
  
  return response.json();
};

/**
 * Kiểm tra kết nối API và trả về chi tiết lỗi
 */
export const getDetailedApiStatus = async (): Promise<{
  connected: boolean;
  message: string;
  statusCode?: number;
}> => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/health-check`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-cache'
    }, 3000);
    
    if (response.ok) {
      return {
        connected: true,
        message: "Kết nối thành công với máy chủ"
      };
    } else {
      return {
        connected: false,
        message: `Lỗi kết nối: ${response.status} ${response.statusText}`,
        statusCode: response.status
      };
    }
  } catch (error) {
    return {
      connected: false,
      message: `Không thể kết nối với máy chủ: ${(error as Error).message}`
    };
  }
};

/**
 * Note: This application uses plain text passwords.
 * In a production environment, you should use proper password encryption.
 */
