'use client';

import { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetX = mouseX;
    let targetY = mouseY;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Mesh points
    const meshSize = 70;
    const meshPoints: Array<{ x: number; y: number; baseX: number; baseY: number }> = [];
    
    for (let x = 0; x <= canvas.width + meshSize; x += meshSize) {
      for (let y = 0; y <= canvas.height + meshSize; y += meshSize) {
        meshPoints.push({ x, y, baseX: x, baseY: y });
      }
    }

    const draw = () => {
      // Smooth mouse follow - EVEN SLOWER
      mouseX += (targetX - mouseX) * 0.015;
      mouseY += (targetY - mouseY) * 0.015;

      // Clear with gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGradient.addColorStop(0, '#fafafa');
      bgGradient.addColorStop(1, '#f5f5f5');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create radial gradient at mouse - SMALLER AND BLACK
      const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 250);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.04)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.02)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw mesh - SLOWER
      for (let i = 0; i < meshPoints.length; i++) {
        const point = meshPoints[i];
        const dx = mouseX - point.baseX;
        const dy = mouseY - point.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 300) {
          const force = (1 - distance / 300) * 35;
          point.x = point.baseX + (dx / distance) * force;
          point.y = point.baseY + (dy / distance) * force;
        } else {
          // Ease back to original position - EVEN SLOWER
          point.x += (point.baseX - point.x) * 0.01;
          point.y += (point.baseY - point.y) * 0.01;
        }
      }

      // Draw mesh connections
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.lineWidth = 1;

      for (let i = 0; i < meshPoints.length; i++) {
        const point = meshPoints[i];
        
        // Connect to right neighbor
        const rightNeighbor = meshPoints.find(
          (p) => p.baseX === point.baseX + meshSize && p.baseY === point.baseY
        );
        
        if (rightNeighbor) {
          const midX = (point.x + rightNeighbor.x) / 2;
          const midY = (point.y + rightNeighbor.y) / 2;
          const midDistance = Math.sqrt(
            Math.pow(midX - mouseX, 2) + Math.pow(midY - mouseY, 2)
          );
          
          if (midDistance < 250) {
            const opacity = 0.12 * (1 - midDistance / 250);
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
            ctx.lineWidth = 1.5;
          } else {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
            ctx.lineWidth = 1;
          }
          
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(rightNeighbor.x, rightNeighbor.y);
          ctx.stroke();
        }
        
        // Connect to bottom neighbor
        const bottomNeighbor = meshPoints.find(
          (p) => p.baseX === point.baseX && p.baseY === point.baseY + meshSize
        );
        
        if (bottomNeighbor) {
          const midX = (point.x + bottomNeighbor.x) / 2;
          const midY = (point.y + bottomNeighbor.y) / 2;
          const midDistance = Math.sqrt(
            Math.pow(midX - mouseX, 2) + Math.pow(midY - mouseY, 2)
          );
          
          if (midDistance < 250) {
            const opacity = 0.12 * (1 - midDistance / 250);
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            ctx.lineWidth = 1.5;
          } else {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
            ctx.lineWidth = 1;
          }
          
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(bottomNeighbor.x, bottomNeighbor.y);
          ctx.stroke();
        }
        
        // Draw point with glow near mouse
        const pointDx = point.x - mouseX;
        const pointDy = point.y - mouseY;
        const pointDistance = Math.sqrt(pointDx * pointDx + pointDy * pointDy);
        
        if (pointDistance < 180) {
          const glowIntensity = 1 - pointDistance / 180;
          
          // Outer glow
          const glowGradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 10);
          glowGradient.addColorStop(0, `rgba(99, 102, 241, ${glowIntensity * 0.3})`);
          glowGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
          ctx.fill();
          
          // Center point
          ctx.fillStyle = `rgba(99, 102, 241, ${glowIntensity * 0.6})`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ filter: 'blur(5px)' }}
    />
  );
}
