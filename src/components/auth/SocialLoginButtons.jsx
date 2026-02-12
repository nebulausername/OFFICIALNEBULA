import React from 'react';
import { Apple, Chrome, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNebulaSound } from '@/contexts/SoundContext';

const SocialLoginButtons = ({ onLogin }) => {
    const { playHover, playClick } = useNebulaSound();

    const handleLogin = (provider) => {
        playClick();
        onLogin(provider);
    };

    return (
        <div className="space-y-4">
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <button
                    onClick={() => handleLogin('apple')}
                    onMouseEnter={playHover}
                    className="relative w-full h-14 bg-black rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-900 transition-all border border-white/10"
                >
                    <Apple className="w-6 h-6 text-white" />
                    <span className="font-bold text-lg text-white">Sign in with Apple</span>
                </button>
            </div>

            <button
                onClick={() => handleLogin('google')}
                onMouseEnter={playHover}
                className="w-full h-14 bg-white text-black rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
                <Chrome className="w-5 h-5 text-black" />
                <span>Sign in with Google</span>
            </button>

            <button
                onClick={() => handleLogin('github')}
                onMouseEnter={playHover}
                className="w-full h-14 bg-[#24292e] text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-[#2f363d] transition-all border border-white/10 font-bold"
            >
                <Github className="w-5 h-5" />
                <span>GitHub Access</span>
            </button>
        </div>
    );
};

export default SocialLoginButtons;
