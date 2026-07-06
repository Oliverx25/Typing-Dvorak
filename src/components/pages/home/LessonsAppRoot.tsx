import AppChrome from '@/components/layout/shell/AppChrome';
import LessonsPageContent from '@/components/pages/home/LessonsPageContent';

/** Single island for /lessons — AppChrome + lazy lesson sections. */
export default function LessonsAppRoot() {
  return (
    <AppChrome>
      <LessonsPageContent />
    </AppChrome>
  );
}
