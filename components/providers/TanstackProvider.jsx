// components/providers/TanstackProvider.js
"use client";
import { getQueryClient } from "@/lib/get-query-client";
import {  QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const TanstackProvider = ({ children }) => {
  // Initialize QueryClient only once using useState
  const queryClient =  getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Remove ReactQueryDevtools in production */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

export default TanstackProvider;
