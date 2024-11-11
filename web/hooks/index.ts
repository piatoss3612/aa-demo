import { useEffect, useState } from "react";

interface Heap {
  track: (event: string, properties?: Object) => void;
  identify: (identity: string) => void;
  resetIdentity: () => void;
  addUserProperties: (properties: Object) => void;
  addEventProperties: (properties: Object) => void;
  removeEventProperty: (property: string) => void;
  clearEventProperties: () => void;
  appid: string;
  userId: string;
  identity: string | null;
  config: any;
}

declare global {
  interface Window {
    heap: Heap;
  }
}

export const useAnalytics = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [heap, setHeap] = useState<Heap | null>(null);

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
