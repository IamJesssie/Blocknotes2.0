import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface GridCell {
  x: number;
  y: number;
  distance: number;
}

export function IsometricGrid() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Generate grid cells
    const cells: GridCell[] = [];
    const cols = 25;
    const rows = 20;
    const cellSize = 60;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push({
          x: col * cellSize,
          y: row * cellSize,
          distance: 0,
        });
      }
    }
    setGridCells(cells);
  }, []);

  const calculateDistance = (cellX: number, cellY: number) => {
    if (!containerRef.current) return 1000;
    
    const rect = containerRef.current.getBoundingClientRect();
    // Convert isometric coordinates to screen coordinates
    const isoX = (cellX - cellY) * 0.866; // cos(30°)
    const isoY = (cellX + cellY) * 0.5;
    
    const screenX = rect.left + isoX + rect.width / 2;
    const screenY = rect.top + isoY + 100;
    
    const dx = mousePos.x - screenX;
    const dy = mousePos.y - screenY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ perspective: '1000px' }}
    >
      <div 
        className="absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          transform: 'rotateX(60deg) rotateZ(45deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {gridCells.map((cell, index) => {
          const distance = calculateDistance(cell.x, cell.y);
          const isNear = distance < 150;
          const elevation = isNear ? Math.max(0, (150 - distance) / 3) : 0;
          const opacity = isNear ? Math.max(0.1, (150 - distance) / 150) : 0.1;
          const scale = isNear ? 1 + (150 - distance) / 500 : 1;

          return (
            <motion.div
              key={`${cell.x}-${cell.y}`}
              className="absolute w-14 h-14 border border-cyan-500/20 bg-gradient-to-br from-purple-500/5 to-cyan-500/5"
              style={{
                left: `${(cell.x - cell.y) * 0.866}px`,
                top: `${(cell.x + cell.y) * 0.5}px`,
                transformStyle: 'preserve-3d',
              }}
              animate={{
                borderColor: isNear 
                  ? `rgba(6, 182, 212, ${opacity})` 
                  : 'rgba(6, 182, 212, 0.1)',
                backgroundColor: isNear
                  ? `rgba(168, 85, 247, ${opacity * 0.3})`
                  : 'rgba(168, 85, 247, 0.02)',
                scale,
                z: elevation,
                boxShadow: isNear
                  ? `0 ${elevation}px ${elevation * 2}px rgba(6, 182, 212, ${opacity * 0.5})`
                  : 'none',
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut"
              }}
            >
              {/* Top face */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"
                animate={{
                  opacity: isNear ? opacity : 0,
                }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Glow effect on hover */}
              {isNear && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: opacity * 0.5, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl"
                  style={{
                    transform: `translateZ(${elevation}px)`,
                  }}
                />
              )}
            </motion.div>
          );
        })}
        
        {/* Ripple effect at mouse position */}
        <motion.div
          className="absolute w-32 h-32 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-2xl opacity-30" />
        </motion.div>
      </div>
    </div>
  );
}
