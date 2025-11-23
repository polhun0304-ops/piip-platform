import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Case } from "../store/casesSlice";
import { API_ENDPOINTS } from "../config/api";

// API 호출 함수
const fetchCases = async (): Promise<Case[]> => {
  const response = await fetch(API_ENDPOINTS.cases);

  if (!response.ok) {
    throw new Error(`Failed to fetch cases: ${response.statusText}`);
  }

  return response.json();
};

const fetchCaseById = async (id: string): Promise<Case> => {
  const response = await fetch(`${API_ENDPOINTS.cases}/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch case: ${response.statusText}`);
  }

  return response.json();
};

const createCase = async (newCase: Omit<Case, "id">): Promise<Case> => {
  const response = await fetch(API_ENDPOINTS.cases, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newCase),
  });

  if (!response.ok) {
    throw new Error(`Failed to create case: ${response.statusText}`);
  }

  return response.json();
};

// React Query hooks
export const useCases = () => {
  return useQuery({
    queryKey: ["cases"],
    queryFn: fetchCases,
  });
};

export const useCase = (id: string) => {
  return useQuery({
    queryKey: ["cases", id],
    queryFn: () => fetchCaseById(id),
    enabled: !!id,
  });
};

export const useCreateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });
};
