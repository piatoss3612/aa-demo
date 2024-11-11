import { useEffect, useState } from "react";

interface HeapAnalytics {
  track?: (event: string, properties?: Record<string, any>) => void;
  identify?: (id: string) => void;
  getIdentity?: () => string;
  resetIdentity?: () => void;
  addEventProperties?: (properties: Record<string, any>) => void;
  removeEventProperty?: (key: string) => void;
  clearEventProperties?: () => void;
  addUserProperties?: (properties: Record<string, any>) => void;
  trackPageview?: (properties?: {
    title?: string;
    url?: string;
    properties?: Record<string, any>;
    previous_page?: string;
  }) => void;
  addPageviewProperties?: (properties: Record<string, any>) => void;
  removePageviewProperty?: (key: string) => void;
  clearPageviewProperties?: () => void;
  onReady?: (callback: () => void) => void;
  getSessionId?: () => string;
  getUserId?: () => string;
}

declare global {
  interface Window {
    heap: HeapAnalytics;
  }
}

export const useAnalytics = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [heap, setHeap] = useState<HeapAnalytics | null>(null);

  useEffect(() => {
    if (!window) {
      return;
    }

    if (window.heap) {
      setIsLoaded(true);
      setHeap(window.heap);
    }
  }, [window]);

  return { isLoaded, heap };
};
