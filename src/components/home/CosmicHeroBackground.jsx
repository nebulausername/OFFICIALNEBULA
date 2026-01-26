import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CosmicHeroBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        let animationFrame;
        const particles = [];

        // Configuration
        const particleCount = 60;
        const colors = ['#8B5CF6', '#F59E0B', '#3B82F6', '#EC4899']; // Purple, Gold, Blue, Pink

        // Particle Class
        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.alpha = Math.random() * 0.5 + 0.1;
                this.pulse = Math.random() * 0.02;
                this.pulseDir = 1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Pulse opacity
                this.alpha += this.pulse * this.pulseDir;
                if (this.alpha > 0.8 || this.alpha < 0.1) this.pulseDir *= -1;

                // Wrap around screen
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.alpha;
                ctx.fill();

                // Glow effect
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.color;
            }
        }

        // Initialize
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw smooth gradient trail (simulating motion blur/nebula gas)
            ctx.globalCompositeOperation = 'source-over';
            // We don't clear completely to leave trails? No, for this style, clean is better but maybe a gradient overlay.

            // Draw Stars
            ctx.globalCompositeOperation = 'lighter';
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Connect near particles (Constellation effect)
            ctx.globalAlpha = 0.05;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 0.5;

            for (let i = 0; i < particles.length; i++) {
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationFrame = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #000 100%)' }}
        />
    );
}
