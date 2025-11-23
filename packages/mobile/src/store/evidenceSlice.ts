import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Evidence {
  id: string;
  label: string;
  type: "이미지" | "오디오" | "문서" | "비디오";
  date: string;
  caseId?: string;
  filePath?: string;
}

interface EvidenceState {
  items: Evidence[];
  loading: boolean;
  error: string | null;
}

const initialState: EvidenceState = {
  items: [
    { id: "a", label: "사진 (CCTV)", type: "이미지", date: "2025-01-16" },
    { id: "b", label: "증언 녹취", type: "오디오", date: "2025-01-18" },
    { id: "c", label: "거래 내역", type: "문서", date: "2025-01-22" },
  ],
  loading: false,
  error: null,
};

const evidenceSlice = createSlice({
  name: "evidence",
  initialState,
  reducers: {
    setEvidence: (state, action: PayloadAction<Evidence[]>) => {
      state.items = action.payload;
    },
    addEvidence: (state, action: PayloadAction<Evidence>) => {
      state.items.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setEvidence, addEvidence, setLoading, setError } =
  evidenceSlice.actions;

export default evidenceSlice.reducer;
