import AppChrome from '@/components/layout/shell/AppChrome';
import MultiplayerIndexPage from './MultiplayerIndexPage';

interface MultiplayerAppRootProps {
  kicked?: boolean;
  roomClosed?: boolean;
}

export default function MultiplayerAppRoot({ kicked, roomClosed }: MultiplayerAppRootProps) {
  return (
    <AppChrome>
      <MultiplayerIndexPage kicked={kicked} roomClosed={roomClosed} />
    </AppChrome>
  );
}
