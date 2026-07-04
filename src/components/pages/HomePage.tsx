import PrimaryActionCard from '@/components/lessons/PrimaryActionCard';
import LessonLibraryGrid from '@/components/lessons/LessonLibraryGrid';
import ExtraPracticeCard from '@/components/lessons/ExtraPracticeCard';
import LearnMoreSection from '@/components/lessons/LearnMoreSection';
import AdaptiveDrillCard from '@/components/lessons/AdaptiveDrillCard';
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
