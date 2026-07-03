export interface CodeSnippet {
  id: string;
  language: 'typescript' | 'html' | 'css' | 'shell';
  titleKey: string;
  code: string;
}

/** Real code fragments for "Modo Código" practice. */
export const CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: 'ts-interface',
    language: 'typescript',
    titleKey: 'tsInterface',
    code: 'interface User { id: string; name: string; email: string; }',
  },
  {
    id: 'ts-arrow',
    language: 'typescript',
    titleKey: 'tsArrow',
    code: 'const handleClick = (event: MouseEvent) => { event.preventDefault(); };',
  },
  {
    id: 'ts-import',
    language: 'typescript',
    titleKey: 'tsImport',
    code: 'import { useState, useEffect } from "react";',
  },
  {
    id: 'html-div',
    language: 'html',
    titleKey: 'htmlDiv',
    code: '<div className="container"><h1>Hello World</h1></div>',
  },
  {
    id: 'html-form',
    language: 'html',
    titleKey: 'htmlForm',
    code: '<form action="/submit" method="post"><input type="email" /></form>',
  },
  {
    id: 'css-flex',
    language: 'css',
    titleKey: 'cssFlex',
    code: '.wrapper { display: flex; align-items: center; gap: 1rem; }',
  },
  {
    id: 'shell-git',
    language: 'shell',
    titleKey: 'shellGit',
    code: 'git commit -m "feat: add dvorak typing practice"',
  },
];
