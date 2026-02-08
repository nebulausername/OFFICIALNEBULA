import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RefreshCw, CheckCircle2, AlertTriangle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { db, storage } from '@/lib/insforge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';

const HAND_GESTURES = ['👍', '✌️', '👌', '🤞', '🤙', '✊', '🙌'];

export default function FaceCaptureModal({ open, onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [currentGesture, setCurrentGesture] = useState(HAND_GESTURES[0]);
    const [permissionError, setPermissionError] = useState(false);
    const { toast } = useToast();
    const { user, checkAppState } = useAuth();

    useEffect(() => {
        if (open) {
            startCamera();
            // Pick random gesture
            setCurrentGesture(HAND_GESTURES[Math.floor(Math.random() * HAND_GESTURES.length)]);
        } else {
            stopCamera();
            setCapturedImage(null);
            setPermissionError(false);
        }
    }, [open]);

    const startCamera = async () => {
        try {
            setPermissionError(false);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 1280, height: 720 },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            setPermissionError(true);
            toast({
                title: 'Kamera-Fehler',
                description: 'Bitte erlaube den Zugriff auf deine Kamera.',
                variant: 'destructive',
            });
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame to canvas
            // Mirror horizontally like the preview
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
            setCapturedImage(imageUrl);
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
    };

    const uploadVerification = async () => {
        if (!capturedImage) return;

        try {
            setIsUploading(true);

            // Convert base64 to blob
            const res = await fetch(capturedImage);
            const blob = await res.blob();

            const formData = new FormData();
            formData.append('photo', blob, 'verification_photo.jpg');
            formData.append('hand_gesture', currentGesture);

            // 1. Upload to Storage
            const fileName = `${user.id}/${Date.now()}_verification.jpg`;
            // @ts-ignore - InsForge SDK likely takes 3 args but types might be wrong, or just 2.
            const { data: uploadData, error: uploadError } = await storage
                .from('verifications')
                .upload(fileName, blob);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const publicUrlResponse = storage
                .from('verifications')
                .getPublicUrl(fileName);

            // Handle both object { data: { publicUrl } } and string return types
            // @ts-ignore
            const publicUrl = publicUrlResponse?.data?.publicUrl || publicUrlResponse;

            // 3. Create Verification Request
            const { error: dbError } = await db
                .from('verification_requests')
                .insert({
                    user_id: user.id,
                    photo_url: publicUrl,
                    hand_gesture: currentGesture,
                    status: 'pending',
                    submitted_at: new Date()
                });

            if (dbError) throw dbError;

            toast({
                title: 'Foto gesendet ✅',
                description: 'Deine Verifizierung wird jetzt geprüft.',
            });

            // Update auth state (pending)
            await checkAppState();
            onClose();

        } catch (error) {
            console.error('Upload failed:', error);
            toast({
                title: 'Fehler beim Senden',
                description: error.response?.data?.message || 'Bitte versuche es erneut.',
                variant: 'destructive',
            });
            // Optionally allow retrying immediately without closing
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md p-0 overflow-hidden ring-0 outline-none gap-0">

                {/* Header */}
                <div className="p-4 bg-zinc-900/50 backdrop-blur border-b border-zinc-800 flex justify-between items-center z-10 relative">
                    <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-[#D6B25E]" />
                        <h2 className="font-bold text-lg">Gesichts-Verifizierung</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-zinc-800 rounded-full">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="relative aspect-[3/4] bg-black">
                    {permissionError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                            <p className="text-white font-semibold mb-2">Kamera-Zugriff verweigert</p>
                            <p className="text-zinc-400 text-sm mb-4">Bitte erlaube den Zugriff in deinen Browser-Einstellungen.</p>
                            <Button onClick={startCamera} variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                                Erneut versuchen
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Media elements */}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full object-cover transform -scale-x-100 ${capturedImage ? 'hidden' : 'block'}`}
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {capturedImage && (
                                <img
                                    src={capturedImage}
                                    alt="Captured"
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Overlay Guidelines (only when live) */}
                            {!capturedImage && !permissionError && (
                                <div className="absolute inset-0 pointer-events-none">
                                    {/* Face Oval Guide */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-[60%] h-[50%] border-2 border-dashed border-white/30 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="absolute top-4 w-full text-center px-4">
                                        <span className="bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-md">
                                            Positioniere dein Gesicht im Rahmen
                                        </span>
                                    </div>

                                    {/* Hand Gesture Hint */}
                                    <div className="absolute bottom-24 right-4 animate-bounce">
                                        <div className="bg-black/80 p-3 rounded-xl border border-[#D6B25E]/50 flex flex-col items-center">
                                            <span className="text-3xl mb-1">{currentGesture}</span>
                                            <span className="text-[10px] uppercase font-bold text-[#D6B25E]">Halte Hand</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Flash Effect */}
                            <AnimatePresence>
                                {isCapturing && (
                                    <motion.div
                                        initial={{ opacity: 0.8 }}
                                        animate={{ opacity: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-white z-20"
                                    />
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-center gap-4">
                    {!capturedImage ? (
                        <Button
                            onClick={() => {
                                setIsCapturing(true);
                                setTimeout(() => {
                                    capturePhoto();
                                    setIsCapturing(false);
                                }, 100);
                            }}
                            disabled={!stream || permissionError}
                            className="h-14 w-14 rounded-full border-4 border-white/20 p-1 bg-transparent hover:bg-white/10"
                        >
                            <div className="w-full h-full rounded-full bg-white transition-transform active:scale-90" />
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={retakePhoto}
                                disabled={isUploading}
                                className="flex-1 bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Neu aufnehmen
                            </Button>
                            <Button
                                onClick={uploadVerification}
                                disabled={isUploading}
                                className="flex-1 bg-[#D6B25E] hover:bg-[#cda64b] text-black font-bold"
                            >
                                {isUploading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                )}
                                Absenden
                            </Button>
                        </>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
}
