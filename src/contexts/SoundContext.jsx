import React, { createContext, useContext, useState, useCallback } from 'react';
import useSound from 'use-sound';

// Fallback empty context
const defaultContext = {
    playClick: () => { },
    playHover: () => { },
    playSuccess: () => { },
    playError: () => { },
    enabled: true,
    toggleSound: () => { }
};

const SoundContext = createContext(defaultContext);

export const useNebulaSound = () => useContext(SoundContext);

// Base64 Sounds for immediate "Wow" effect (Short, crisp UI sounds)
// Click: Subtle high-tech click
const CLICK_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';
// Hover: Very faint high freq swipe
const HOVER_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3';
// Success: Nice achievement chime
const SUCCESS_SOUND = 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3';
// Error: Low tech buzz
const ERROR_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3';

export const SoundProvider = ({ children }) => {
    const [enabled, setEnabled] = useState(true);

    const [playClick] = useSound(CLICK_SOUND, { volume: 0.4, interrupt: true });
    const [playHover] = useSound(HOVER_SOUND, { volume: 0.05, interrupt: true }); // Very quiet
    const [playSuccess] = useSound(SUCCESS_SOUND, { volume: 0.5 });
    const [playError] = useSound(ERROR_SOUND, { volume: 0.3 });

    const toggleSound = () => setEnabled(prev => !prev);

    const safePlay = useCallback((playFn) => {
        if (enabled && playFn) {
            try {
                playFn();
            } catch (e) {
                // Ignore play errors (e.g. no user interaction yet)
            }
        }
    }, [enabled]);

    return (
        <SoundContext.Provider value={{
            playClick: () => safePlay(playClick),
            playHover: () => safePlay(playHover),
            playSuccess: () => safePlay(playSuccess),
            playError: () => safePlay(playError),
            enabled,
            toggleSound
        }}>
            {children}
        </SoundContext.Provider>
    );
};
