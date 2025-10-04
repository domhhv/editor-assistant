'use client';

import * as React from 'react';

import useHideLoadingScreen from '@/lib/hooks/use-hide-loading-screen';

type ViewMode = 'chat' | 'split' | 'editor';

type MobileLayoutContextType = {
  isMobile: boolean;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
};

export const MobileLayoutContext = React.createContext<MobileLayoutContextType>(
  {
    isMobile: false,
    viewMode: 'split',
    setViewMode: () => {},
  }
);

const STORAGE_KEY = 'mobile_view_mode_preference';

export default function MobileLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null);
  const [viewMode, setViewModeState] = React.useState<ViewMode>('split');

  React.useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768);
    }

    // Load saved preference
    try {
      const savedMode = localStorage.getItem(STORAGE_KEY) as ViewMode | null;

      if (savedMode && ['chat', 'split', 'editor'].includes(savedMode)) {
        setViewModeState(savedMode);
      }
    } catch (error) {
      console.error('Failed to load view mode preference:', error);
    }

    // Check mobile status
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const setViewMode = React.useCallback(
    (mode: ViewMode) => {
      setViewModeState(mode);

      if (isMobile) {
        try {
          localStorage.setItem(STORAGE_KEY, mode);
        } catch (error) {
          console.error('Failed to save view mode preference:', error);
        }
      }
    },
    [isMobile]
  );

  const value = React.useMemo(() => {
    return { isMobile: isMobile ?? false, setViewMode, viewMode };
  }, [viewMode, setViewMode, isMobile]);

  // Hide loading screen once we're ready to render
  useHideLoadingScreen();

  // Don't render until we know if mobile or not
  if (isMobile === null) {
    return null;
  }

  return (
    <MobileLayoutContext.Provider value={value}>
      {children}
    </MobileLayoutContext.Provider>
  );
}
