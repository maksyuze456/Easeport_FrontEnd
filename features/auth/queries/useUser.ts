import { useQuery } from "@tanstack/react-query";
import { getUser } from "../api/auth";

export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: getUser,
    retry: false,
    staleTime: 60*1000,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always'
    
  });
}