// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { csvParseRows } from 'd3';

// Define a service using a base URL and expected endpoints
export const tableAPI = createApi({
  reducerPath: 'tableApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/tables/' }),
  endpoints: (builder) => ({
    getTableData: builder.query({
        query: (endpoint) => ({
            url: `${endpoint}`,
            responseHandler: async (response) => csvParseRows(await response.text())
        })
    }),
    getWorkflowData: builder.query({
        async queryFn(_args, _queryAPI, _extraOptions) {
            const rowLimit = 10;

            const tablePromises = _args.map(async ({endpoint, columns}) => 
                await _queryAPI.dispatch(tableAPI.endpoints.getTableData.initiate(endpoint))
                    // Limit the number of rows
                    .then(results => ({...results, data: [...results.data.slice(0, rowLimit)] }))
                    // Keep only selected columns and arrange in specified order, and populate null column cells
                    .then(results => ({
                        ...results, 
                        data: results.data.map(row => columns.map((index) => index !== null ? row[index] : "null"))
                    }))
            );

            return Promise.all(tablePromises)
                .then(results => ({
                    data: results.map(({data}) => data),
                    error: results.map(({error}) => error).pop(),
                    isLoading: results.map(({isLoading}) => isLoading).includes(true)
                }));
        }
    }),
  }),
});

// Export hooks for usage in functional compo®ents, which are
// auto-generated based on the defined endpoints
export const { useGetTableDataQuery, useGetWorkflowDataQuery } = tableAPI;