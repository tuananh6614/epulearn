
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Không xác định';
  }
}

// Cache management
export const clearLocalCache = () => {
  try {
    localStorage.removeItem('queryClient');
    localStorage.removeItem('persistedQueries');
    console.log('Local cache cleared');
  } catch (error) {
    console.error('Error clearing local cache:', error);
  }
};

// Mobile detection
export const isMobile = (): boolean => {
  return window.innerWidth < 768 || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Network status checker
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Retry logic for API calls
export const retryPromise = <T>(
  fn: () => Promise<T>, 
  retriesLeft = 3, 
  interval = 1000
): Promise<T> => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        if (retriesLeft === 0) {
          reject(error);
          return;
        }
        
        setTimeout(() => {
          retryPromise(fn, retriesLeft - 1, interval)
            .then(resolve)
            .catch(reject);
        }, interval);
      });
  });
};
