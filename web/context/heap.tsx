import Script from "next/script";
import { createContext, useEffect, useState } from "react";

declare global {
  interface Window {
    heap: any;
  }
}

interface HeapAnalyticsContextType {
  isLoaded: boolean;
  heap: any;
}

export const HeapAnalyticsContext = createContext<HeapAnalyticsContextType>({
  isLoaded: false,
  heap: null,
});

export const HeapAnalyticsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [heap, setHeap] = useState<any>(null);

  const handleScriptReady = () => {
    if (window.heap) {
      setIsLoaded(true);
      setHeap(window.heap);
    }
  };

  useEffect(() => {
    if (isLoaded && heap) {
      heap.identify("123456");
      heap.track("Initialized");
    }
  }, [isLoaded, heap]);

  useEffect(() => {
    if (window.heap) {
      handleScriptReady();
    }
  }, [window.heap]);

  return (
    <>
      <Script
        id="heap-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.heapReadyCb=window.heapReadyCb||[],window.heap=window.heap||[],heap.load=function(e,t){window.heap.envId=e,window.heap.clientConfig=t=t||{},window.heap.clientConfig.shouldFetchServerConfig=!1;var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src="https://cdn.us.heap-api.com/config/"+e+"/heap_config.js";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(a,r);var n=["init","startTracking","stopTracking","track","resetIdentity","identify","getSessionId","getUserId","getIdentity","addUserProperties","addEventProperties","removeEventProperty","clearEventProperties","addAccountProperties","addAdapter","addTransformer","addTransformerFn","onReady","addPageviewProperties","removePageviewProperty","clearPageviewProperties","trackPageview"],i=function(e){return function(){var t=Array.prototype.slice.call(arguments,0);window.heapReadyCb.push({name:e,fn:function(){heap[e]&&heap[e].apply(heap,t)}})}};for(var p=0;p<n.length;p++)heap[n[p]]=i(n[p])};
          heap.load("787122287");`,
        }}
      />
      <HeapAnalyticsContext.Provider
        value={{
          isLoaded,
          heap,
        }}
      >
        {children}
      </HeapAnalyticsContext.Provider>
    </>
  );
};
