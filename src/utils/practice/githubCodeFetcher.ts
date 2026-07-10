import { sanitizeCodeSnippet } from '@/utils/practice/sanitizeCodeSnippet';

export interface GitHubRawSource {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

/** Curated public files — fetched via raw.githubusercontent.com to avoid search API rate limits. */
export const CURATED_GITHUB_SOURCES: GitHubRawSource[] = [
  { owner: 'withastro', repo: 'astro', branch: 'main', path: 'packages/astro/src/core/errors/userError.ts' },
  { owner: 'fastapi', repo: 'fastapi', branch: 'master', path: 'fastapi/exceptions.py' },
  { owner: 'pallets', repo: 'click', branch: 'main', path: 'src/click/utils.py' },
  { owner: 'supabase', repo: 'supabase-js', branch: 'master', path: 'packages/core/supabase-js/src/lib/helpers.ts' },
  { owner: 'vuejs', repo: 'core', branch: 'main', path: 'packages/shared/src/general.ts' },
  { owner: 'sindresorhus', repo: 'type-fest', branch: 'main', path: 'source/partial-deep.d.ts' },
  { owner: 'pallets', repo: 'flask', branch: 'main', path: 'src/flask/helpers.py' },
  { owner: 'facebook', repo: 'react', branch: 'main', path: 'packages/react/src/ReactNoopUpdateQueue.js' },
];

const SEARCH_QUERIES = [
  'language:typescript size:800..4000 extension:ts NOT filename:test',
  'language:python size:800..4000 extension:py NOT filename:test',
  'language:javascript size:800..4000 extension:js NOT filename:test',
];

function rawUrl(source: GitHubRawSource): string {
  return `https://raw.githubusercontent.com/${source.owner}/${source.repo}/${source.branch}/${source.path}`;
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffleIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, index) => index);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

async function fetchRawSource(source: GitHubRawSource, signal?: AbortSignal): Promise<string | null> {
  const response = await fetch(rawUrl(source), { signal });
  if (!response.ok) return null;
  const text = await response.text();
  return text.trim() ? text : null;
}

async function fetchFromGitHubSearch(signal?: AbortSignal): Promise<string | null> {
  const query = pick(SEARCH_QUERIES);
  const url = `https://api.github.com/search/code?q=${encodeURIComponent(query)}&sort=indexed&order=desc&per_page=5`;

  const response = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    items?: Array<{
      path: string;
      repository?: { full_name?: string; default_branch?: string };
    }>;
  };

  const items = data.items ?? [];
  for (const item of items) {
    const fullName = item.repository?.full_name;
    if (!fullName || !item.path) continue;

    const [owner, repo] = fullName.split('/');
    const branch = item.repository?.default_branch ?? 'main';
    const raw = await fetchRawSource({ owner, repo, branch, path: item.path }, signal);
    const sanitized = raw ? sanitizeCodeSnippet(raw) : null;
    if (sanitized) return sanitized;
  }

  return null;
}

async function fetchCuratedSnippet(signal?: AbortSignal): Promise<string | null> {
  for (const index of shuffleIndices(CURATED_GITHUB_SOURCES.length)) {
    try {
      const raw = await fetchRawSource(CURATED_GITHUB_SOURCES[index], signal);
      const sanitized = raw ? sanitizeCodeSnippet(raw) : null;
      if (sanitized) return sanitized;
    } catch (error) {
      if (signal?.aborted) throw error;
    }
  }
  return null;
}

/** Fetches a sanitized code snippet from curated raw URLs, with GitHub search as fallback. */
export async function fetchGitHubCodeSnippet(signal?: AbortSignal): Promise<string | null> {
  const curated = await fetchCuratedSnippet(signal);
  if (curated) return curated;

  try {
    return await fetchFromGitHubSearch(signal);
  } catch (error) {
    if (signal?.aborted) throw error;
    return null;
  }
}
