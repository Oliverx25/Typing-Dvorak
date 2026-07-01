export type LessonCategory = 'drill' | 'words' | 'sentences';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  texts: string[];
}

export const LESSONS: Lesson[] = [
  {
    id: 'home-row',
    title: 'Home Row',
    description: 'Master the foundation: A O E U I and D H T N S.',
    category: 'drill',
    difficulty: 1,
    texts: [
      'aoeu aoeu iuia iuia',
      'dhtn dhtn snth snth',
      'aoeui dhtns aoeui dhtns',
      'ueoa nshtd ueoa nshtd',
      'aouie thnsd aouie thnsd',
    ],
  },
  {
    id: 'top-row',
    title: 'Top Row',
    description: 'Practice the top row: \' , . P Y F G C R L.',
    category: 'drill',
    difficulty: 2,
    texts: [
      'pyfg pyfg crlf crlf',
      ',.py ,.py fgcr fgcr',
      'pyfgcrl ,.pyfgcrl',
      'flyrcg py,. flyrcg py,.',
    ],
  },
  {
    id: 'bottom-row',
    title: 'Bottom Row',
    description: 'Train the bottom row: ; Q J K X B M W V Z.',
    category: 'drill',
    difficulty: 2,
    texts: [
      'qjkx qjkx bmwv bmwv',
      ';qjk ;qjk xbmw xbmw',
      'qjkxbmwv ;qjkxbmwv',
      'vjwm xkjq vjwm xkjq',
    ],
  },
  {
    id: 'all-rows',
    title: 'All Rows',
    description: 'Combine every row into fluid typing patterns.',
    category: 'drill',
    difficulty: 3,
    texts: [
      'the quick brown fox jumps over the lazy dog',
      'practice dvorak layout every single day',
      'typing speed grows with consistent daily drills',
      'flow state comes when fingers know each key',
    ],
  },
  {
    id: 'common-words',
    title: 'Common Words',
    description: 'High-frequency English words optimized for Dvorak.',
    category: 'words',
    difficulty: 3,
    texts: [
      'the and for are but not you all can had her was one our out',
      'day get has him his how man new now old see way who boy did',
      'its let put say she too use dad mom run sun top try win yes',
      'about after again being could every first found great house',
    ],
  },
  {
    id: 'sentences',
    title: 'Sentences',
    description: 'Full sentences to build rhythm and accuracy.',
    category: 'sentences',
    difficulty: 4,
    texts: [
      'Learning Dvorak takes patience and daily practice.',
      'Your fingers will gradually find their home positions.',
      'Accuracy matters more than speed when you are starting out.',
      'The Dvorak layout reduces finger travel and strain over time.',
      'Keep your eyes on the screen and trust your muscle memory.',
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Challenge',
    description: 'Longer passages for experienced Dvorak typists.',
    category: 'sentences',
    difficulty: 5,
    texts: [
      'Programming languages use many symbols and punctuation marks that require practice on any keyboard layout.',
      'The Dvorak Simplified Keyboard was patented in 1936 by August Dvorak and his brother-in-law William Dealey.',
      'Switching from QWERTY to Dvorak is a commitment, but many typists report less fatigue after the transition period.',
    ],
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}
