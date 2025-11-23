import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Case {
  id: string;
  title: string;
  date: string;
  status: "조사 중" | "종료" | "대기";
  description?: string;
}

interface CasesState {
  items: Case[];
  selectedCaseId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: CasesState = {
  items: [
    {
      id: "1",
      title: "사건 #1: 도난 사건",
      date: "2025-01-15",
      status: "조사 중",
    },
    {
      id: "2",
      title: "사건 #2: 사기 의혹",
      date: "2025-01-20",
      status: "조사 중",
    },
    { id: "3", title: "사건 #3: 분쟁", date: "2025-02-01", status: "대기" },
  ],
  selectedCaseId: null,
  loading: false,
  error: null,
};

const casesSlice = createSlice({
  name: "cases",
  initialState,
  reducers: {
    setCases: (state, action: PayloadAction<Case[]>) => {
      state.items = action.payload;
    },
    selectCase: (state, action: PayloadAction<string>) => {
      state.selectedCaseId = action.payload;
    },
    clearSelectedCase: (state) => {
      state.selectedCaseId = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCases, selectCase, clearSelectedCase, setLoading, setError } =
  casesSlice.actions;

export default casesSlice.reducer;
