import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, ShieldCheck, Fingerprint, Lock, Cpu, Globe, AlertTriangle, Terminal } from 'lucide-react';
import { useNebulaSound } from '@/contexts/SoundContext';

const BiometricGate = ({ onVerified }) => {
    const webcamRef = useRef(null);
    const [scanning, setScanning] = useState(true);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('INITIALIZING BIO-SCANNER...');
    const [isVerified, setIsVerified] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [noCameraMode, setNoCameraMode] = useState(false);

    // Sound effects
    const soundContext = useNebulaSound();
    const playHover = soundContext?.playHover || (() => { });
    const playClick = soundContext?.playClick || (() => { });

    // Simulation Sequence
    useEffect(() => {
        let interval;
        if (scanning && (permissionGranted || noCameraMode)) {
            // Start scanning sound if available (mocking it with repeated clicks for now if no specific scan sound)

            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        completeScan();
                        return 100;
                    }
                    // Faster progress in no-camera mode (simulation)
                    const speed = noCameraMode ? 8 : 4;
                    return prev + (Math.random() * speed);
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [scanning, permissionGranted, noCameraMode]);

    // Status Text Updates based on progress
    useEffect(() => {
        if (progress < 20) setStatus(noCameraMode ? 'BYPASSING OPTICAL SENSORS...' : 'DETECTING FACE MESH...');
        else if (progress < 50) setStatus(noCameraMode ? 'ESTABLISHING NEURAL LINK...' : 'ANALYZING BIOMETRIC DATA...');
        else if (progress < 80) setStatus('VERIFYING IDENTITY AGAINST NEBULA DB...');
        else if (progress < 100) setStatus('FINALIZING SECURE HANDSHAKE...');
    }, [progress, noCameraMode]);

    const completeScan = () => {
        setScanning(false);
        setStatus('IDENTITY CONFIRMED');
        setIsVerified(true);
        if (playClick) playClick(); // Play success sound

        // Wait 1.5s to show success state then unmount
        setTimeout(() => {
            onVerified();
        }, 1500);
    };

    const handleWebcamError = (e) => {
        console.error("Webcam Error", e);
        setNoCameraMode(true);
        setStatus("OPTICAL SENSORS OFFLINE - SWITCHING TO NEURAL SIMULATION");
        // Auto-start simulation after short delay
        setTimeout(() => setScanning(true), 500);
    };

    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: "user"
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#050608] flex flex-col items-center justify-center overflow-hidden font-mono">
            {/* Background Tech Grid */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050608_90%)] pointer-events-none" />

            <AnimatePresence>
                {!isVerified ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        className="relative w-full max-w-lg p-6 flex flex-col items-center"
                    >
                        {/* Header */}
                        <div className="mb-8 text-center space-y-2">
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <Fingerprint className={`w-12 h-12 ${noCameraMode ? 'text-red-500' : 'text-[#D6B25E]'} animate-pulse`} />
                                    <div className={`absolute -inset-4 ${noCameraMode ? 'bg-red-500/20' : 'bg-[#D6B25E]/20'} blur-xl rounded-full`} />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-[0.2em]">
                                {noCameraMode ? 'MANUAL OVERRIDE' : 'SECURITY CHECK'}
                            </h2>
                            <p className="text-zinc-500 text-xs">NEBULA PROTOCOL V4.2</p>
                        </div>

                        {/* Scanner Frame */}
                        <div className="relative w-full aspect-[4/3] bg-black rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl group">
                            {/* Corner Brackets */}
                            <div className={`absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 ${noCameraMode ? 'border-red-500' : 'border-[#D6B25E]'} z-20 transition-colors duration-500`} />
                            <div className={`absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 ${noCameraMode ? 'border-red-500' : 'border-[#D6B25E]'} z-20 transition-colors duration-500`} />
                            <div className={`absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 ${noCameraMode ? 'border-red-500' : 'border-[#D6B25E]'} z-20 transition-colors duration-500`} />
                            <div className={`absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 ${noCameraMode ? 'border-red-500' : 'border-[#D6B25E]'} z-20 transition-colors duration-500`} />

                            {/* Scanning Overlay Line */}
                            {scanning && (permissionGranted || noCameraMode) && (
                                <motion.div
                                    animate={{ top: ["0%", "100%", "0%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className={`absolute left-0 right-0 h-1 ${noCameraMode ? 'bg-red-500/50 box-shadow-[0_0_20px_#ef4444]' : 'bg-[#D6B25E]/50 box-shadow-[0_0_20px_#D6B25E]'} z-30`}
                                />
                            )}

                            {/* Content: Websim or Glitch Effect */}
                            {noCameraMode ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 z-10 text-center p-6 space-y-4">
                                    <div className="relative">
                                        <AlertTriangle className="w-16 h-16 text-red-500 opacity-50 absolute inset-0 animate-ping" />
                                        <Terminal className="w-16 h-16 text-red-500 relative z-10" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-red-400 font-bold tracking-widest text-sm animate-pulse">CAMERA SIGNAL LOST</p>
                                        <p className="text-zinc-500 text-xs">INITIATING SIMULATION SEQUENCE...</p>
                                    </div>
                                    <div className="w-full max-w-[200px] h-32 overflow-hidden text-[10px] text-green-500/50 text-left font-mono opacity-50">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                                                {`> bypassing_node_${9000 + i}... OK`}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={videoConstraints}
                                    onUserMedia={() => setPermissionGranted(true)}
                                    onUserMediaError={handleWebcamError}
                                    className="w-full h-full object-cover opacity-80"
                                />
                            )}

                            {/* Waiting State */}
                            {!permissionGranted && !noCameraMode && (
                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 z-20 text-center p-6">
                                    <div className="animate-pulse">
                                        <Scan className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                                        <p className="text-zinc-400 text-sm">INITIALIZING...</p>
                                    </div>
                                </div>
                            )}

                            {/* Grid Overlay */}
                            <div className="absolute inset-0 bg-[url('/grid.png')] opacity-20 z-10 mix-blend-overlay pointer-events-none" />
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full mt-8 space-y-2">
                            <div className={`flex justify-between text-[10px] font-mono ${noCameraMode ? 'text-red-400' : 'text-[#D6B25E]'}`}>
                                <span>{status}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${noCameraMode ? 'bg-red-500' : 'bg-[#D6B25E]'}`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Decor Elements */}
                        <div className="mt-8 grid grid-cols-3 gap-4 w-full text-center opacity-50">
                            <div className="flex flex-col items-center gap-1 text-[10px] text-zinc-500 font-mono">
                                <Lock className="w-4 h-4" />
                                <span>ENCRYPTED</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 text-[10px] text-zinc-500 font-mono">
                                <Cpu className="w-4 h-4" />
                                <span>AI CORE</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 text-[10px] text-zinc-500 font-mono">
                                <Globe className="w-4 h-4" />
                                <span>SECURE</span>
                            </div>
                        </div>

                    </motion.div>
                ) : (
                    /* SUCCESS STATE */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center space-y-6"
                    >
                        <div className="relative">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3)]"
                            >
                                <ShieldCheck className="w-12 h-12 text-green-400" />
                            </motion.div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">ACCESS GRANTED</h2>
                            <p className="text-green-400 font-mono tracking-widest text-xs uppercase opacity-80">
                                Welcome to Nebula Supply
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BiometricGate;
