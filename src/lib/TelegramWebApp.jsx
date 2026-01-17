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
      
      // Set theme colors
      tg.setHeaderColor('#0B0D12');
      tg.setBackgroundColor('#0B0D12');
      
      // Ready
      tg.ready();
      
      return () => {
        // Cleanup if needed
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
