import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Evidence } from "../store/evidenceSlice";
import { API_ENDPOINTS } from "../config/api";

// API 호출 함수
const fetchEvidence = async (): Promise<Evidence[]> => {
  const response = await fetch(API_ENDPOINTS.evidence);

  if (!response.ok) {
    throw new Error(`Failed to fetch evidence: ${response.statusText}`);
  }

  return response.json();
};

const fetchEvidenceByCaseId = async (caseId: string): Promise<Evidence[]> => {
  const response = await fetch(`${API_ENDPOINTS.evidence}?caseId=${caseId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch evidence: ${response.statusText}`);
  }

  return response.json();
};

type RNFile = { uri: string; name: string; type: string };
type UploadPayload = {
  file: File | RNFile;
  label?: string;
  caseId?: string;
  date?: string;
};

const uploadEvidence = async (payload: UploadPayload): Promise<Evidence> => {
  const form = new FormData();
  // RN과 Web 동시 지원
  const f: any = payload.file as any;
  if (typeof File !== "undefined" && f instanceof File) {
    form.append("file", f);
  } else {
    form.append("file", {
      uri: f.uri,
      name: f.name,
      type: f.type,
    } as any);
  }
  if (payload.label) form.append("label", payload.label);
  if (payload.caseId) form.append("caseId", payload.caseId);
  if (payload.date) form.append("date", payload.date);

  const response = await fetch(`${API_ENDPOINTS.evidence}/upload`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload evidence: ${response.statusText}`);
  }

  return response.json();
};

type UploadUrlPayload = {
  url: string;
  label?: string;
  caseId?: string;
  date?: string;
};

const uploadEvidenceByUrl = async (
  payload: UploadUrlPayload
): Promise<Evidence> => {
  const response = await fetch(`${API_ENDPOINTS.evidence}/fetch-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok)
    throw new Error(`Failed to fetch URL: ${response.statusText}`);
  return response.json();
};

// React Query hooks
export const useEvidence = () => {
  return useQuery({
    queryKey: ["evidence"],
    queryFn: fetchEvidence,
  });
};

export const useEvidenceByCase = (caseId: string) => {
  return useQuery({
    queryKey: ["evidence", "case", caseId],
    queryFn: () => fetchEvidenceByCaseId(caseId),
    enabled: !!caseId,
  });
};

export const useUploadEvidence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadEvidence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
    },
  });
};

export const useUploadEvidenceByUrl = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadEvidenceByUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
    },
  });
};
