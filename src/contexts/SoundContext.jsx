import React, { createContext, useContext, useState, useEffect } from 'react';
import useSound from 'use-sound';

const SoundContext = createContext();

export const useNebulaSound = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
    const [enabled, setEnabled] = useState(true);

    // Define sounds - utilizing reliable CDN sounds or local if configured
    // Ideally, you should put .mp3 files in public/sounds/
    // For now, using placeholders or generic base64 if possible, or paths assuming they exist.
    // Since I can't upload files easily, I will assume the user has to add files 
    // OR I use a public URL. Let's use simple paths and warn if missing.

    const [playClick] = useSound('/sounds/click.mp3', { volume: 0.5 });
    const [playHover] = useSound('/sounds/hover.mp3', { volume: 0.1 });
    const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.5 });
    const [playError] = useSound('/sounds/error.mp3', { volume: 0.5 });

    const toggleSound = () => setEnabled(prev => !prev);

    const safePlay = (playFn) => {
        if (enabled) {
            try {
                playFn();
            } catch (e) {
                // Ignore play errors (e.g. no user interaction yet)
            }
        }
    };

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
