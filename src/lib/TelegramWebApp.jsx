import { useEffect } from 'react';

// Type declaration for Telegram WebApp SDK
/** @typedef {Window & { Telegram?: { WebApp: any } }} TelegramWindow */


/**
 * React hook to initialize and configure the Telegram WebApp SDK.
 * Automatically expands the app, sets theme colors, and handles back button.
 * Should be called once in the root component (e.g., App.jsx).
 * 
 * @example
 * function App() {
 *   useTelegramWebApp();
 *   return <div>...</div>;
 * }
 */
export const useTelegramWebApp = () => {
  useEffect(() => {
    // @ts-ignore - Telegram WebApp SDK is injected by Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      // @ts-ignore
      const tg = window.Telegram.WebApp;

      // Expand WebApp to full height
      tg.expand();

      // Enable closing confirmation
      tg.enableClosingConfirmation();

      // Set theme colors based on Telegram theme
      const themeParams = tg.themeParams;
      const bgColor = themeParams.bg_color || '#0B0D12';
      const headerColor = themeParams.bg_color || '#0B0D12';

      tg.setHeaderColor(headerColor);
      tg.setBackgroundColor(bgColor);

      // Enable vibration (haptic feedback)
      if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
      }


      // Handle back button
      if (tg.BackButton) {
        tg.BackButton.onClick(() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            tg.close();
          }
        });
        tg.BackButton.show();
      }

      // Ready
      tg.ready();

      // Log WebApp info for debugging
      console.log('Telegram WebApp initialized:', {
        version: tg.version,
        platform: tg.platform,
        colorScheme: tg.colorScheme,
        themeParams: tg.themeParams,
      });

      return () => {
        // Cleanup
        if (tg.BackButton) {
          tg.BackButton.hide();
        }
      };
    }
  }, []);
};

/**
 * Gets the Telegram WebApp SDK instance.
 * 
 * @returns {object|null} Telegram WebApp object or null if not in Telegram environment
 */
export const getTelegramWebApp = () => {
  // @ts-ignore - Telegram WebApp SDK is injected by Telegram
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    // @ts-ignore
    return window.Telegram.WebApp;
  }
  return null;
};

/**
 * Checks if the app is running inside Telegram WebApp.
 * 
 * @returns {boolean} True if running in Telegram WebApp, false otherwise
 */
export const isTelegramWebApp = () => {
  // @ts-ignore - Telegram WebApp SDK is injected by Telegram
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;
};

// Get Telegram user data
export const getTelegramUser = () => {
  const tg = getTelegramWebApp();
  if (tg?.initDataUnsafe?.user) {
    return tg.initDataUnsafe.user;
  }
  return null;
};

/**
 * Trigger haptic feedback on supported devices.
 * 
 * @param {'impact' | 'notification' | 'selection'} type - Type of haptic feedback
 * @param {'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'} style - Intensity style (for impact) or type (for notification)
 */
export const hapticFeedback = (type = 'impact', style = 'medium') => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    if (type === 'impact') {
      tg.HapticFeedback.impactOccurred(style);
    } else if (type === 'notification') {
      tg.HapticFeedback.notificationOccurred(style);
    } else if (type === 'selection') {
      tg.HapticFeedback.selectionChanged();
    }
  }
};

// Show alert
export const showTelegramAlert = (message) => {
  const tg = getTelegramWebApp();
  if (tg?.showAlert) {
    tg.showAlert(message);
  } else {
    alert(message);
  }
};

// Show confirm
export const showTelegramConfirm = (message) => {
  return new Promise((resolve) => {
    const tg = getTelegramWebApp();
    if (tg?.showConfirm) {
      tg.showConfirm(message, (confirmed) => {
        resolve(confirmed);
      });
    } else {
      resolve(confirm(message));
    }
  });
};

// Show main button
export const showMainButton = (text, onClick) => {
  const tg = getTelegramWebApp();
  if (tg?.MainButton) {
    tg.MainButton.setText(text);
    tg.MainButton.onClick(onClick);
    tg.MainButton.show();
    return () => {
      tg.MainButton.hide();
      tg.MainButton.offClick(onClick);
    };
  }
  return () => { };
};

// Hide main button
export const hideMainButton = () => {
  const tg = getTelegramWebApp();
  if (tg?.MainButton) {
    tg.MainButton.hide();
  }
};

// Set main button text
export const setMainButtonText = (text) => {
  const tg = getTelegramWebApp();
  if (tg?.MainButton) {
    tg.MainButton.setText(text);
  }
};

// Enable/disable main button
export const setMainButtonEnabled = (enabled) => {
  const tg = getTelegramWebApp();
  if (tg?.MainButton) {
    if (enabled) {
      tg.MainButton.enable();
    } else {
      tg.MainButton.disable();
    }
  }
};

// Show back button
export const showBackButton = (onClick) => {
  const tg = getTelegramWebApp();
  if (tg?.BackButton) {
    tg.BackButton.onClick(onClick);
    tg.BackButton.show();
    return () => {
      tg.BackButton.hide();
      tg.BackButton.offClick(onClick);
    };
  }
  return () => { };
};

// Hide back button
export const hideBackButton = () => {
  const tg = getTelegramWebApp();
  if (tg?.BackButton) {
    tg.BackButton.hide();
  }
};

// Open Telegram link
export const openTelegramLink = (url) => {
  const tg = getTelegramWebApp();
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, '_blank');
  }
};

// Open link
export const openLink = (url) => {
  const tg = getTelegramWebApp();
  if (tg?.openLink) {
    tg.openLink(url);
  } else {
    window.open(url, '_blank');
  }
};

// Close WebApp
export const closeWebApp = () => {
  const tg = getTelegramWebApp();
  if (tg?.close) {
    tg.close();
  }
};

// Removed duplicate functions - closeWebApp() and showTelegramConfirm() are the canonical versions

// Back button handler
export const setupTelegramBackButton = (onBack) => {
  const tg = getTelegramWebApp();
  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(onBack);

    return () => {
      tg.BackButton.offClick(onBack);
      tg.BackButton.hide();
    };
  }
  return () => { };
};

// Main button handler
export const setupTelegramMainButton = (text, onClick, options = {}) => {
  const tg = getTelegramWebApp();
  if (tg?.MainButton) {
    tg.MainButton.setText(text);
    tg.MainButton.onClick(onClick);

    if (options.show !== false) {
      tg.MainButton.show();
    }
    if (options.progress !== undefined) {
      tg.MainButton.showProgress(options.progress);
    }
    if (options.color) {
      tg.MainButton.color = options.color;
    }
    if (options.textColor) {
      tg.MainButton.textColor = options.textColor;
    }

    return () => {
      tg.MainButton.offClick(onClick);
      tg.MainButton.hide();
    };
  }
  return () => { };
};
