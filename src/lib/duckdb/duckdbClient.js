/**
 * @fileoverview duckdbClient Module
 *
 * Singleton DuckDB WASM client initialization and management. Handles bundle selection,
 * worker initialization, and provides a single database instance for the application.
 *
 * Features:
 * - DuckDB WASM initialization
 * - Bundle selection (MVP or EH)
 * - Singleton pattern for database instance
 * - Worker management
 *
 * @module lib/duckdb/duckdbClient
 *
 * @example
 * import { getDuckDB } from './duckdbClient';
 * const db = await getDuckDB();
 * const conn = await db.connect();
 */

import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";

const MANUAL_BUNDLES = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
};

let dbInstance = null;

export async function getDuckDB() {
  if (dbInstance) return dbInstance;

  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

  // Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(bundle.mainWorker);
  const logger = new duckdb.ConsoleLogger();

  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  dbInstance = db;
  return db;
}
