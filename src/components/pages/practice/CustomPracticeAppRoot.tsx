import AppChrome from '@/components/layout/shell/AppChrome';
import CustomPracticeShell from '@/components/pages/practice/CustomPracticeShell';

export default function CustomPracticeAppRoot() {
  return (
    <AppChrome>
      <CustomPracticeShell />
    </AppChrome>
  );
}
