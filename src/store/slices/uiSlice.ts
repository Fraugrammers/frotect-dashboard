import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  serverId: string | null;
  timeRange: '1h' | '24h' | '7d';
}

const initialState: UIState = {
  serverId: null,
  timeRange: '1h',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setServerId: (state, action: PayloadAction<string | null>) => {
      state.serverId = action.payload;
    },
    setTimeRange: (state, action: PayloadAction<UIState['timeRange']>) => {
      state.timeRange = action.payload;
    },
  },
});

export const { setServerId, setTimeRange } = uiSlice.actions;
export default uiSlice.reducer;
