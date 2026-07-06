import { describe, it, expect } from 'vitest';
import { ACHIEVEMENT_CATALOG, generateCatalogSeedSql } from '@/utils/achievements/catalogData';

describe('achievement seed generator', () => {
  it('exports a non-empty catalog', () => {
    expect(ACHIEVEMENT_CATALOG.length).toBeGreaterThan(80);
  });

  it('generates valid SQL seed syntax', () => {
    const sql = generateCatalogSeedSql();
    expect(sql).toContain('insert into public.achievements_catalog');
    expect(sql).toContain('on conflict (id) do update set');
  });
});
