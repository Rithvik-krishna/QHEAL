import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/** Animated quantum particle canvas background */
export function QuantumBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', resize);

    // Nodes
    const N = 60;
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      hue: Math.random() > 0.5 ? 200 : 270, // blue or purple
    }));

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // Draw edges between close nodes
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.25;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `hsla(210, 90%, 65%, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${n.hue}, 90%, 70%, 0.6)`;
        ctx.fill();

        // Glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 12);
        grad.addColorStop(0, `hsla(${n.hue}, 90%, 70%, 0.15)`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(n.x, n.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Move
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      animFrame = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="quantum-bg"
        style={{ opacity: 0.4 }}
      />
      {/* Subtle radial gradients */}
      <div className="quantum-bg" style={{
        background: `
          radial-gradient(ellipse 70% 50% at 20% 20%, rgba(14,165,233,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 50% 60% at 80% 80%, rgba(139,92,246,0.08) 0%, transparent 60%)
        `,
      }} />

      {/* Scan line */}
      <motion.div
        className="quantum-bg"
        style={{
          background: 'linear-gradient(transparent, rgba(14,165,233,0.03) 50%, transparent)',
          height: '120px',
        }}
        animate={{ y: [-120, window.innerHeight + 120] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
    </>
  );
}
