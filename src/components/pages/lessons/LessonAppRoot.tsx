import AppChrome from '@/components/layout/shell/AppChrome';
import LessonPage from './LessonPage';

interface LessonAppRootProps {
  lessonId: string;
}

export default function LessonAppRoot({ lessonId }: LessonAppRootProps) {
  return (
    <AppChrome>
      <LessonPage lessonId={lessonId} />
    </AppChrome>
  );
}
