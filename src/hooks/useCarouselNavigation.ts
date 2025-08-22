import { useCallback, useEffect } from 'react';

interface NavigationOptions {
  onNext: () => void;
  onPrevious: () => void;
  onSelect: () => void;
  onPause: () => void;
  onEscape: () => void;
  disabled?: boolean;
}

export function useCarouselNavigation(options: NavigationOptions) {
  const {
    onNext,
    onPrevious,
    onSelect,
    onPause,
    onEscape,
    disabled = false
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    // Prevent default behavior for navigation keys
    const navigationKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' ', 'Escape'];
    if (navigationKeys.includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        onPrevious();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        onNext();
        break;
      case 'Enter':
        onSelect();
        break;
      case ' ':
        onPause();
        break;
      case 'Escape':
        onEscape();
        break;
      case 'Home':
        // Go to first item (could be implemented)
        break;
      case 'End':
        // Go to last item (could be implemented)
        break;
    }
  }, [onNext, onPrevious, onSelect, onPause, onEscape, disabled]);

  useEffect(() => {
    if (disabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, disabled]);

  return {
    handleKeyDown
  };
}

