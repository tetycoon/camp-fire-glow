import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
}

const NeuralNetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let nodes: Node[] = [];
    const NODE_COUNT = 55;
    const MAX_DIST = 160;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize nodes
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.5 + 1.5,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let t = 0;
    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.25;
            // Alternate between cyan and purple connections
            const usePurple = (i + j) % 3 === 0;
            const gradient = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            if (usePurple) {
              gradient.addColorStop(0, `hsla(265, 85%, 65%, ${alpha})`);
              gradient.addColorStop(1, `hsla(199, 100%, 55%, ${alpha * 0.5})`);
            } else {
              gradient.addColorStop(0, `hsla(199, 100%, 55%, ${alpha})`);
              gradient.addColorStop(1, `hsla(183, 100%, 55%, ${alpha * 0.5})`);
            }
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            // Animate a data packet along some connections
            if ((i * j) % 7 === 0) {
              const progress = ((t * 0.8 + i * 0.3) % 1);
              const px = nodes[i].x + (nodes[j].x - nodes[i].x) * progress;
              const py = nodes[i].y + (nodes[j].y - nodes[i].y) * progress;
              ctx.beginPath();
              ctx.arc(px, py, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = usePurple
                ? `hsla(265, 85%, 75%, 0.8)`
                : `hsla(199, 100%, 70%, 0.8)`;
              ctx.fill();
            }
          }
        }
      }

      // Draw nodes
      nodes.forEach((n, i) => {
        const pulse = Math.sin(t * 1.5 + n.pulsePhase) * 0.5 + 0.5;
        const gRadius = n.radius * 4 + pulse * 6;

        // Glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, gRadius);
        const isSpecial = i % 5 === 0;
        const isOrange = i % 8 === 0;
        if (isOrange) {
          grd.addColorStop(0, `hsla(25, 100%, 60%, ${0.6 + pulse * 0.4})`);
          grd.addColorStop(1, `hsla(25, 100%, 60%, 0)`);
        } else if (isSpecial) {
          grd.addColorStop(0, `hsla(265, 85%, 65%, ${0.7 + pulse * 0.3})`);
          grd.addColorStop(1, `hsla(265, 85%, 65%, 0)`);
        } else {
          grd.addColorStop(0, `hsla(199, 100%, 55%, ${0.6 + pulse * 0.4})`);
          grd.addColorStop(1, `hsla(199, 100%, 55%, 0)`);
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, gRadius, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = isOrange
          ? `hsla(25, 100%, 70%, 0.95)`
          : isSpecial
          ? `hsla(265, 85%, 80%, 0.95)`
          : `hsla(199, 100%, 75%, 0.95)`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.55 }}
    />
  );
};

export default NeuralNetworkBackground;
