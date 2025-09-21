import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface KpiSummary {
  cpu: number; ram: number; disk: number; alerts: number;
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (build) => ({
    getKpiSummary: build.query<KpiSummary, { serverId?: string; range?: string } | void>({
      query: (args) => {
        const search = new URLSearchParams();
        if (args?.serverId) search.set('serverId', args.serverId);
        if (args?.range) search.set('range', args.range);
        const qs = search.toString();
        return `/kpi${qs ? `?${qs}` : ''}`;
      },
    }),
    getLogs: build.query<{ id: string; ts: string; level: string; msg: string }[], { limit?: number } | void>({
      query: (args) => `/logs?limit=${args?.limit ?? 200}`,
    }),
  }),
});

export const { useGetKpiSummaryQuery, useGetLogsQuery } = api;
