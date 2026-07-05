import PrimaryActionCard from '@/components/lessons/cards/PrimaryActionCard';
import LessonLibraryGrid from '@/components/lessons/library/LessonLibraryGrid';
import ExtraPracticeCard from '@/components/lessons/cards/ExtraPracticeCard';
import LearnMoreSection from '@/components/lessons/library/LearnMoreSection';
import AdaptiveDrillCard from '@/components/lessons/cards/AdaptiveDrillCard';
import { FocusedChapterProvider } from '@/contexts/FocusedChapterProvider';

export default function HomePage() {
  return (
    <FocusedChapterProvider>
      <PrimaryActionCard />
      <AdaptiveDrillCard />
      <LessonLibraryGrid />
      <ExtraPracticeCard />
      <LearnMoreSection />
    </FocusedChapterProvider>
  );
}
