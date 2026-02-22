import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/shared/hooks/useTheme";

const DARK_COLORS = {
  bg: "#0a0a0a",
  ring: "rgba(255, 255, 255, 0.05)",
  ringDash: "rgba(255, 255, 255, 0.03)",
  particle: "rgba(255, 255, 255, 0.8)",
  dust: (a: number) => `rgba(200, 200, 200, ${a})`,
  shadowColor: "rgba(255,255,255,0.4)",
  coreCenter: "#fff",
  coreEdge: "rgba(255,255,255,0)",
  coreShadow: "rgba(255,255,255,0.5)",
  vignette: "rgba(0, 0, 0, 0.6)",
} as const;

const LIGHT_COLORS = {
  bg: "#f5f5f5",
  ring: "rgba(0, 0, 0, 0.06)",
  ringDash: "rgba(0, 0, 0, 0.04)",
  particle: "rgba(0, 0, 0, 0.5)",
  dust: (a: number) => `rgba(80, 80, 80, ${a * 0.6})`,
  shadowColor: "rgba(0,0,0,0.15)",
  coreCenter: "#333",
  coreEdge: "rgba(50,50,50,0)",
  coreShadow: "rgba(0,0,0,0.2)",
  vignette: "rgba(245, 245, 245, 0.5)",
} as const;

interface Orbit {
  rx: number;
  ry: number;
  speed: number;
  count: number;
  phase: number;
  dashed: boolean;
}

const ORBITS: Orbit[] = [
  { rx: 110, ry: 110, speed: 0.02, count: 1, phase: 0, dashed: false },
  { rx: 190, ry: 160, speed: -0.015, count: 2, phase: 1.4, dashed: true },
  { rx: 300, ry: 250, speed: 0.01, count: 2, phase: 0.7, dashed: false },
  { rx: 410, ry: 330, speed: -0.008, count: 3, phase: 2.3, dashed: true },
  { rx: 550, ry: 430, speed: 0.005, count: 2, phase: 0.3, dashed: false },
  { rx: 700, ry: 540, speed: -0.003, count: 1, phase: 1.8, dashed: true },
];

const DUST_COUNT = 40;
const SCALE_BASE = 1000;

interface DustParticle {
  x: number;
  y: number;
  r: number;
  a: number;
  vy: number;
  vx: number;
}

function OrbitAuthBackground(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const { theme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const createDust = useCallback((): DustParticle[] => {
    return Array.from({ length: DUST_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.12 + 0.04,
      vy: -(Math.random() * 0.00004 + 0.00001),
      vx: (Math.random() - 0.5) * 0.00002,
    }));
  } , []);

  useEffect(() => {
    const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    const dust = createDust();
    let lastTime = performance.now();
    let animationFrameId: number;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      targetMouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      };
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    resize();

    const draw = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) * 0.06; // Normalize to ~60fps
      lastTime = currentTime;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const scale = Math.min(w, h) / SCALE_BASE;

      // Smooth lerp for mouse parallax
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;

      const cx = w / 2 + mouseRef.current.x;
      const cy = h / 2 + mouseRef.current.y;

      // Clear
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // 1. Dust Layer (Background)
      for (const d of dust) {
        d.y += d.vy * deltaTime * 16;
        d.x += d.vx * deltaTime * 16;
        if (d.y < -0.05) d.y = 1.05;
        if (d.x < -0.05) d.x = 1.05;
        if (d.x > 1.05) d.x = -0.05;

        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
        ctx.fillStyle = colors.dust(d.a);
        ctx.fill();
      }

      // 2. Orbits & Particles
      ORBITS.forEach((orbit) => {
        const rx = orbit.rx * scale;
        const ry = orbit.ry * scale;

        // Draw Ring
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = orbit.dashed ? colors.ringDash : colors.ring;
        ctx.setLineDash(orbit.dashed ? [2, 10] : []);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw Particles on Ring
        for (let i = 0; i < orbit.count; i++) {
          const speedFactor = orbit.speed * 0.01;
          const angle = (currentTime * speedFactor) + orbit.phase + (i * Math.PI * 2) / orbit.count;
          const px = cx + Math.cos(angle) * rx;
          const py = cy + Math.sin(angle) * ry;

          // Bloom effect for particles
          ctx.shadowBlur = 10 * scale;
          ctx.shadowColor = colors.shadowColor;

          ctx.beginPath();
          ctx.arc(px, py, 2 * scale, 0, Math.PI * 2);
          ctx.fillStyle = colors.particle;
          ctx.fill();

          ctx.shadowBlur = 0; // Reset blur
        }
      });

      // 3. Central Core
      const pulse = Math.sin(currentTime * 0.002) * 0.2 + 0.8;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 6 * scale);
      coreGrad.addColorStop(0, colors.coreCenter);
      coreGrad.addColorStop(1, colors.coreEdge);

      ctx.shadowBlur = 20 * scale * pulse;
      ctx.shadowColor = colors.coreShadow;
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 6 * scale * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 4. Final Vignette (Overlay)
      const vignette = ctx.createRadialGradient(cx, cy, w * 0.1, cx, cy, w * 0.8);
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, colors.vignette);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [createDust, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ background: isDark ? DARK_COLORS.bg : LIGHT_COLORS.bg }}
      aria-hidden="true"
    />
  );
}

export default OrbitAuthBackground;