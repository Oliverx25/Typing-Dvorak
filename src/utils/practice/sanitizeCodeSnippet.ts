const MAX_LINE_LENGTH = 80;
const MIN_LINES = 15;
const MAX_LINES = 25;
const MIN_PLAYABLE_CHARS = 80;

/** Strips license headers, normalizes whitespace, and returns a teleprompter-friendly code block. */
export function sanitizeCodeSnippet(rawCode: string): string | null {
  let code = rawCode.replace(/\r\n/g, '\n').trim();
  if (!code) return null;

  code = stripLeadingCommentBlocks(code);
  const lines = collapseBlankLines(code.split('\n').map((line) => line.trimEnd()));
  if (lines.length === 0) return null;

  const playable = extractPlayableWindow(lines);
  if (!playable || playable.join('\n').trim().length < MIN_PLAYABLE_CHARS) return null;

  return playable.join('\n');
}

function stripLeadingCommentBlocks(source: string): string {
  let code = source;

  while (true) {
    const trimmed = code.trimStart();
    if (trimmed.startsWith('/*')) {
      const end = trimmed.indexOf('*/');
      if (end === -1) break;
      code = trimmed.slice(end + 2);
      continue;
    }

    const lineBreak = trimmed.indexOf('\n');
    const firstLine = lineBreak === -1 ? trimmed : trimmed.slice(0, lineBreak);
    if (/^\s*(#|\/\/)/.test(firstLine)) {
      code = lineBreak === -1 ? '' : trimmed.slice(lineBreak + 1);
      continue;
    }

    break;
  }

  return code.trim();
}

function collapseBlankLines(lines: string[]): string[] {
  const result: string[] = [];
  let blankRun = 0;

  for (const line of lines) {
    if (line.trim() === '') {
      blankRun += 1;
      if (blankRun <= 1) result.push('');
      continue;
    }
    blankRun = 0;
    result.push(line);
  }

  return result;
}

function extractPlayableWindow(lines: string[]): string[] | null {
  const candidates: string[] = [];

  for (let start = 0; start < lines.length; start++) {
    if (!isMeaningfulCodeLine(lines[start])) continue;

    const window: string[] = [];
    for (let i = start; i < lines.length && window.length < MAX_LINES; i++) {
      const line = lines[i];
      if (line.length > MAX_LINE_LENGTH) continue;
      if (line.trim() === '' && window.length === 0) continue;
      window.push(line);
    }

    const trimmedWindow = trimTrailingBlankLines(window);
    if (trimmedWindow.length < MIN_LINES) continue;

    const normalized = trimmedWindow.slice(0, MAX_LINES);
    if (normalized.every((line) => line.length <= MAX_LINE_LENGTH)) {
      candidates.push(normalized.join('\n'));
    }
  }

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)].split('\n');
}

function isMeaningfulCodeLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^(import|export|from|const|let|var|function|class|interface|type|def|async|return|if|for|while)\b/.test(trimmed)) {
    return true;
  }
  return /[{([;=]/.test(trimmed);
}

function trimTrailingBlankLines(lines: string[]): string[] {
  const copy = [...lines];
  while (copy.length > 0 && copy[copy.length - 1].trim() === '') {
    copy.pop();
  }
  return copy;
}
