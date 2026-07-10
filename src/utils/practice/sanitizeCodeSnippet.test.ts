import { describe, expect, it } from 'vitest';
import { sanitizeCodeSnippet } from '@/utils/practice/sanitizeCodeSnippet';

describe('sanitizeCodeSnippet', () => {
  it('removes leading license comments and trims to a playable window', () => {
    const raw = `# Licensed under MIT
# Copyright 2024

import os


def greet(name):
    return f"hello {name}"


def farewell(name):
    return f"bye {name}"


class Greeter:
    def __init__(self, prefix):
        self.prefix = prefix

    def speak(self, name):
        return f"{self.prefix} {name}"


def main():
    greeter = Greeter("hi")
    print(greeter.speak("world"))
    print(farewell("world"))
    return greeter


if __name__ == "__main__":
    main()
`;

    const result = sanitizeCodeSnippet(raw);
    expect(result).not.toBeNull();
    expect(result).not.toContain('Licensed under MIT');
    expect(result!.split('\n').length).toBeGreaterThanOrEqual(15);
    expect(result!.split('\n').every((line) => line.length <= 80)).toBe(true);
  });

  it('returns null for minified one-line blobs', () => {
    const raw = 'var a=function(){return{"key":"value","other":"long string that exceeds the limit easily"}};';
    expect(sanitizeCodeSnippet(raw)).toBeNull();
  });
});
