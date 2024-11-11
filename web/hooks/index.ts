import { HeapAnalyticsContext } from "@/context/heap";
import { useContext } from "react";

export const useAnalytics = () => {
  return useContext(HeapAnalyticsContext);
};
