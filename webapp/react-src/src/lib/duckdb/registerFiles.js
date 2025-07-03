import { getDuckDB } from "./duckdbClient";

// Register the file in DuckDB's virtual FS
export async function registerFiles(files) {
  const db = await getDuckDB();
  files.forEach(async (file) => {
    const text = await file.text();
    await db.registerFileText(file.name, text);
  });

  return null; // No result needed, just register the file
}
