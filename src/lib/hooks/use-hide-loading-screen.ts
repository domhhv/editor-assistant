import { useEffect } from 'react';

export default function useHideLoadingScreen() {
  useEffect(() => {
    // Small delay to ensure everything is mounted and painted
    const timer = setTimeout(() => {
      const loader = document.getElementById('app-loading');

      if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.2s ease-out';

        setTimeout(() => {
          loader.style.display = 'none';
        }, 200);
      }
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, []);
}
