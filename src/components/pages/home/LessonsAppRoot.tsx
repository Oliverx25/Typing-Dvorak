import AppChrome from '@/components/layout/shell/AppChrome';
import LessonsPageContent from './LessonsPageContent';

/** Single island for /lessons — AppChrome + lazy lesson sections. */
export default function LessonsAppRoot() {
  return (
    <AppChrome>
      <LessonsPageContent />
    </AppChrome>
  );
}
