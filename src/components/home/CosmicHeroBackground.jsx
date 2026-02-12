import React, { useEffect, useRef } from 'react';

const CosmicHeroBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let nebulae = [];
        let shootingStars = [];
        let animationId;

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
            initNebulae();
        };

        const initNebulae = () => {
            nebulae = [
                { x: width * 0.2, y: height * 0.3, radius: 300, color: [139, 92, 246], phase: 0, speed: 0.003 },
                { x: width * 0.8, y: height * 0.6, radius: 250, color: [214, 178, 94], phase: Math.PI, speed: 0.004 },
                { x: width * 0.5, y: height * 0.15, radius: 200, color: [59, 130, 246], phase: Math.PI / 2, speed: 0.002 },
                { x: width * 0.7, y: height * 0.8, radius: 180, color: [168, 85, 247], phase: Math.PI * 1.5, speed: 0.0035 },
            ];
        };

        const initParticles = () => {
            particles = [];
            const particleCount = Math.min(width * 0.12, 180);
            for (let i = 0; i < particleCount; i++) {
                const isGold = Math.random() > 0.7;
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: isGold ? Math.random() * 2.5 + 1 : Math.random() * 1.8 + 0.3,
                    color: isGold
                        ? `rgba(214,178,94,${Math.random() * 0.6 + 0.3})`
                        : Math.random() > 0.5
                            ? `rgba(139,92,246,${Math.random() * 0.4 + 0.1})`
                            : `rgba(37,192,244,${Math.random() * 0.4 + 0.1})`,
                    vx: (Math.random() - 0.5) * 0.15,
                    vy: (Math.random() - 0.5) * 0.15,
                    alpha: Math.random() * 0.5 + 0.2,
                    pulse: Math.random() * 0.015 + 0.005,
                    isGold,
                    twinkleSpeed: Math.random() * 0.03 + 0.01,
                    twinklePhase: Math.random() * Math.PI * 2,
                });
            }
        };

        const spawnShootingStar = () => {
            if (shootingStars.length < 2 && Math.random() < 0.008) {
                const startX = Math.random() * width * 0.8 + width * 0.1;
                const startY = Math.random() * height * 0.3;
                shootingStars.push({
                    x: startX,
                    y: startY,
                    length: Math.random() * 80 + 40,
                    speed: Math.random() * 4 + 3,
                    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
                    life: 1,
                    decay: 0.015 + Math.random() * 0.01,
                    width: Math.random() * 2 + 1,
                });
            }
        };

        let time = 0;

        const animate = () => {
            time += 0.016;
            ctx.clearRect(0, 0, width, height);

            // Draw nebula glows
            nebulae.forEach(n => {
                n.phase += n.speed;
                const pulse = Math.sin(n.phase) * 0.3 + 0.7;
                const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * pulse);
                gradient.addColorStop(0, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${0.08 * pulse})`);
                gradient.addColorStop(0.5, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${0.03 * pulse})`);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(n.x - n.radius, n.y - n.radius, n.radius * 2, n.radius * 2);
            });

            // Draw particles with twinkle
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.twinklePhase += p.twinkleSpeed;

                const twinkle = Math.sin(p.twinklePhase) * 0.4 + 0.6;

                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;
                if (p.y < -10) p.y = height + 10;
                if (p.y > height + 10) p.y = -10;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * twinkle, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha * twinkle;
                ctx.fill();

                // Gold particles get a glow
                if (p.isGold && p.radius > 1.5) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(214,178,94,${0.06 * twinkle})`;
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
            });

            // Shooting stars
            spawnShootingStar();
            shootingStars = shootingStars.filter(s => {
                s.x += Math.cos(s.angle) * s.speed;
                s.y += Math.sin(s.angle) * s.speed;
                s.life -= s.decay;

                if (s.life <= 0) return false;

                const tailX = s.x - Math.cos(s.angle) * s.length * s.life;
                const tailY = s.y - Math.sin(s.angle) * s.length * s.life;

                const gradient = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
                gradient.addColorStop(0, 'rgba(255,255,255,0)');
                gradient.addColorStop(0.6, `rgba(214,178,94,${0.3 * s.life})`);
                gradient.addColorStop(1, `rgba(255,255,255,${0.8 * s.life})`);

                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(s.x, s.y);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = s.width * s.life;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Bright head glow
                ctx.beginPath();
                ctx.arc(s.x, s.y, 2 * s.life, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${0.9 * s.life})`;
                ctx.fill();

                return true;
            });

            animationId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none opacity-70 mix-blend-screen"
        />
    );
};

export default CosmicHeroBackground;
