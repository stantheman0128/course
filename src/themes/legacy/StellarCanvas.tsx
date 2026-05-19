import { useEffect, useRef } from 'react';

const STAR_COLORS = [
  { r: 102, g: 126, b: 234 },
  { r: 118, g: 75, b: 162 },
  { r: 147, g: 197, b: 253 },
  { r: 196, g: 181, b: 253 },
  { r: 165, g: 180, b: 252 },
];

const CONFIG = {
  starCount: 130,
  minStarSize: 0.6,
  maxStarSize: 4,
  connectionDistance: 150,
  mouseRadius: 200,
  baseSpeed: 0.15,
  shootingStarInterval: 12000,
  shootingStarChance: 0.4,
};

interface Star {
  x: number; y: number; vx: number; vy: number;
  size: number; baseOpacity: number;
  color: { r: number; g: number; b: number };
  twinkleSpeed: number; twinklePhase: number; twinkleAmount: number;
}
interface ShootingStar { x: number; y: number; vx: number; vy: number; life: number; decay: number; length: number; size: number; }
interface Ripple { x: number; y: number; radius: number; maxRadius: number; life: number; decay: number; }

export function StellarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let ripples: Ripple[] = [];
    const mouse: { x: number | null; y: number | null } = { x: null, y: null };
    let time = 0;
    let rafId = 0;

    function resize() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
    }

    function createStars() {
      stars = [];
      for (let i = 0; i < CONFIG.starCount; i++) {
        const sizeRandom = Math.random();
        let size;
        if (sizeRandom < 0.6) size = CONFIG.minStarSize + Math.random() * 1;
        else if (sizeRandom < 0.9) size = 1.5 + Math.random() * 1.5;
        else size = 2.5 + Math.random() * (CONFIG.maxStarSize - 2.5);

        const depthFactor = size / CONFIG.maxStarSize;
        const speed = CONFIG.baseSpeed * (0.3 + depthFactor * 0.7);
        const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];

        stars.push({
          x: Math.random() * width, y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed, vy: (Math.random() - 0.5) * speed,
          size,
          baseOpacity: size > 2.5 ? 0.4 + Math.random() * 0.2 : 0.5 + Math.random() * 0.4,
          color,
          twinkleSpeed: 0.02 + Math.random() * 0.03,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleAmount: 0.2 + Math.random() * 0.3,
        });
      }
    }

    function createShootingStar() {
      if (Math.random() > CONFIG.shootingStarChance) return;
      const startX = Math.random() * width * 0.7;
      const startY = Math.random() * height * 0.3;
      const angle = Math.PI / 6 + Math.random() * Math.PI / 6;
      const speed = 8 + Math.random() * 6;
      shootingStars.push({
        x: startX, y: startY,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1, decay: 0.015 + Math.random() * 0.01,
        length: 80 + Math.random() * 60,
        size: 1.5 + Math.random() * 1,
      });
    }

    function createRipple(x: number, y: number) {
      ripples.push({ x, y, radius: 0, maxRadius: 150 + Math.random() * 100, life: 1, decay: 0.02 });
    }

    function drawStar(star: Star) {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
      const opacity = star.baseOpacity + twinkle * star.twinkleAmount * star.baseOpacity;
      ctx!.beginPath();
      ctx!.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${Math.max(0.1, opacity)})`;
      ctx!.fill();
    }

    function drawShootingStar(s: ShootingStar) {
      const grad = ctx!.createLinearGradient(s.x, s.y, s.x - s.vx * s.length / 10, s.y - s.vy * s.length / 10);
      grad.addColorStop(0, `rgba(255, 255, 255, ${s.life * 0.9})`);
      grad.addColorStop(0.3, `rgba(200, 210, 255, ${s.life * 0.6})`);
      grad.addColorStop(1, 'rgba(102, 126, 234, 0)');
      ctx!.beginPath();
      ctx!.moveTo(s.x, s.y);
      ctx!.lineTo(s.x - s.vx * s.length / 10, s.y - s.vy * s.length / 10);
      ctx!.strokeStyle = grad;
      ctx!.lineWidth = s.size * s.life;
      ctx!.lineCap = 'round';
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.arc(s.x, s.y, s.size * s.life * 1.5, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(255, 255, 255, ${s.life})`;
      ctx!.fill();
    }

    function drawRipple(r: Ripple) {
      ctx!.beginPath();
      ctx!.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(102, 126, 234, ${r.life * 0.3})`;
      ctx!.lineWidth = 2;
      ctx!.stroke();
    }

    function drawConnection(a: Star, b: Star, distance: number) {
      const opacity = 1 - (distance / CONFIG.connectionDistance);
      ctx!.beginPath();
      ctx!.moveTo(a.x, a.y);
      ctx!.lineTo(b.x, b.y);
      ctx!.strokeStyle = `rgba(102, 126, 234, ${opacity * 0.18})`;
      ctx!.lineWidth = 0.8;
      ctx!.stroke();
    }

    function update() {
      time++;
      stars.forEach(star => {
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0 || star.x > width) star.vx *= -1;
        if (star.y < 0 || star.y > height) star.vy *= -1;
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - star.x;
          const dy = mouse.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.mouseRadius) {
            const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
            star.x -= dx * force * 0.015;
            star.y -= dy * force * 0.015;
          }
        }
        ripples.forEach(ripple => {
          const dx = ripple.x - star.x;
          const dy = ripple.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (Math.abs(dist - ripple.radius) < 30) {
            const force = (1 - Math.abs(dist - ripple.radius) / 30) * ripple.life;
            star.x -= dx / dist * force * 2;
            star.y -= dy / dist * force * 2;
          }
        });
      });
      shootingStars.forEach(s => { s.x += s.vx; s.y += s.vy; s.life -= s.decay; });
      shootingStars = shootingStars.filter(s => s.life > 0);
      ripples.forEach(r => { r.radius += 4; r.life -= r.decay; });
      ripples = ripples.filter(r => r.life > 0);
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < CONFIG.connectionDistance) drawConnection(stars[i], stars[j], distance);
        }
        if (mouse.x !== null && mouse.y !== null) {
          const dx = stars[i].x - mouse.x;
          const dy = stars[i].y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < CONFIG.mouseRadius) {
            ctx!.beginPath();
            ctx!.moveTo(stars[i].x, stars[i].y);
            ctx!.lineTo(mouse.x, mouse.y);
            const opacity = 1 - (distance / CONFIG.mouseRadius);
            ctx!.strokeStyle = `rgba(118, 75, 162, ${opacity * 0.25})`;
            ctx!.lineWidth = 0.8;
            ctx!.stroke();
          }
        }
      }
      ripples.forEach(drawRipple);
      stars.forEach(drawStar);
      shootingStars.forEach(drawShootingStar);
    }

    function animate() {
      update();
      draw();
      rafId = requestAnimationFrame(animate);
    }

    const onResize = () => { resize(); createStars(); };
    const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = () => { mouse.x = null; mouse.y = null; };
    const onClick = (e: MouseEvent) => createRipple(e.clientX, e.clientY);

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('click', onClick);
    const intervalId = window.setInterval(createShootingStar, CONFIG.shootingStarInterval);

    resize();
    createStars();
    animate();
    const firstShootingTimeout = window.setTimeout(createShootingStar, 2000);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('click', onClick);
      clearInterval(intervalId);
      clearTimeout(firstShootingTimeout);
    };
  }, []);

  return <canvas ref={ref} id="stellar-bg"></canvas>;
}
