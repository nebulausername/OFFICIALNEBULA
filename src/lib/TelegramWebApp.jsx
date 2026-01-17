import { useEffect } from 'react';

// Telegram WebApp SDK Integration
export const useTelegramWebApp = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
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
      
      // Set viewport settings
      tg.viewportStableHeight = window.innerHeight;
      
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

// Get Telegram WebApp instance
export const getTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

// Check if running in Telegram WebApp
export const isTelegramWebApp = () => {
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

// Haptic feedback
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
  return () => {};
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
  return () => {};
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

// Show confirm (existing function)
export const showTelegramConfirmOld = (message) => {
  return new Promise((resolve) => {
    const tg = getTelegramWebApp();
    if (tg?.showConfirm) {
      tg.showConfirm(message, resolve);
    } else {
      resolve(confirm(message));
    }
  });
};

// Close WebApp
export const closeTelegramWebApp = () => {
  const tg = getTelegramWebApp();
  if (tg?.close) {
    tg.close();
  }
};

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
  return () => {};
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
  return () => {};
};
