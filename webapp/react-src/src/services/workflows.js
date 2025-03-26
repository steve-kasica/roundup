/**
 * workflows.js
 * --------------------------------------------------------------------
 * A RTK Query service for getting workflow schema data
 */

// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Table } from '../lib/types';

export const workflowAPI = createApi({
    reducerPath: "workflowApi",
    baseQuery: fetchBaseQuery({baseUrl: "/workflows/"}),
    endpoints: builder => ({
        getWorkflows: builder.query({
            query: () => ({
                url: `index.json`
            })
        }),
        getWorkflowSchemas: builder.query({
            async queryFn(_args, _queryAPI, _extraOptions) {
                const workflowEndpoint = _args;
                
                const workflowSchemas = await _queryAPI
                    .dispatch(workflowAPI.endpoints.getWorkflowData.initiate(workflowEndpoint));
                
                if (workflowSchemas.error) return { error: workflowSchemas.error }

                const schemaPromises = workflowSchemas.data.tables.map(async (schemaEndpoint, i) => 
                    await _queryAPI
                        .dispatch(workflowAPI.endpoints.getTableSchema.initiate(`${workflowEndpoint}/${schemaEndpoint}`))
                        .then(result => ({
                            ...result, // error, isLoading, etc...
                            data: new Table(...Object.values(result.data)),
                        }))
                );

                return Promise.all(schemaPromises)
                    .then(results => ({
                        data: results.map(({data}) => data),
                        error: results.map(({error}) => error).pop(),
                        isLoading: results.map(({isLoading}) => isLoading).includes(true)
                    }));
            }

        }),
        getWorkflowData: builder.query({
            query: (endpoint) => ({
                url: `${endpoint}/index.json`
            })
        }),
        getTableSchema: builder.query({
            query: (endpoint) => ({
                url: `${endpoint}/schema.json`
            })
        })
    })
});

export const { useGetWorkflowsQuery, useGetWorkflowSchemasQuery } = workflowAPI;