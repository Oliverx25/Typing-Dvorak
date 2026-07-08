import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateCatalogSeedSql } from '../src/utils/achievements/catalogData';

const outPath = resolve(import.meta.dirname, '../supabase/seeds/achievements_catalog_seed.sql');
const sql = generateCatalogSeedSql();
writeFileSync(outPath, sql);
console.log(`Wrote ${outPath} (${sql.split('\n').length} lines)`);
