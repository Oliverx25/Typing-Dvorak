import PrimaryActionCard from '@/components/lessons/PrimaryActionCard';
import LessonLibraryGrid from '@/components/lessons/LessonLibraryGrid';
import ExtraPracticeCard from '@/components/lessons/ExtraPracticeCard';
import LearnMoreSection from '@/components/lessons/LearnMoreSection';
import AdaptiveDrillCard from '@/components/lessons/AdaptiveDrillCard';

export default function HomePage() {
  return (
    <>
      <PrimaryActionCard />
      <AdaptiveDrillCard />
      <LessonLibraryGrid />
      <ExtraPracticeCard />
      <LearnMoreSection />
    </>
  );
}
