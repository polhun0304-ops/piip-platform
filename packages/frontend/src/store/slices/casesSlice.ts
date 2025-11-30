import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CaseSummary {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  clientId?: string;
  assignedDetectiveId?: string;
  description?: string;
  createdAt?: string;
  date?: string;
}

interface CasesState {
  items: CaseSummary[];
}

const initialState: CasesState = {
  items: [
    { id: '1', title: 'Missing person: Kim', status: 'open', priority: 'high' },
    {
      id: '2',
      title: 'Business fraud: ACME Ltd',
      status: 'in_progress',
      priority: 'medium',
    },
  ],
};

const casesSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    addCase(state, action: PayloadAction<CaseSummary>) {
      state.items.unshift(action.payload);
    },
    updateCase(state, action: PayloadAction<CaseSummary>) {
      const idx = state.items.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
  },
});

export const { addCase, updateCase } = casesSlice.actions;
export default casesSlice.reducer;
