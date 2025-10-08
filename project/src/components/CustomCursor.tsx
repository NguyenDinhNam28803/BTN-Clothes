import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [cursorType, setCursorType] = useState('default');
  const [isVisible, setIsVisible] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const trailCountRef = useRef(0);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const followerX = useMotionValue(0);
  const followerY = useMotionValue(0);
  const followerXSpring = useSpring(followerX, { damping: 30, stiffness: 150 });
  const followerYSpring = useSpring(followerY, { damping: 30, stiffness: 150 });

  useEffect(() => {
    const updateCursorPosition = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      followerX.set(e.clientX);
      followerY.set(e.clientY);

      if (!isVisible) setIsVisible(true);

      const id = trailCountRef.current++;
      setTrail((prev) => [
        ...prev.slice(-8),
        { x: e.clientX, y: e.clientY, id },
      ]);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.closest('[data-cursor="shirt"]')) {
        setCursorType('shirt');
      } else if (target.closest('[data-cursor="pants"]')) {
        setCursorType('pants');
      } else if (target.closest('[data-cursor="zoom"]')) {
        setCursorType('zoom');
      } else if (target.closest('button, a, [role="button"], .product-card, input, textarea')) {
        setCursorType('pointer');
      } else if (target.closest('[data-cursor="sale"]')) {
        setCursorType('sale');
      } else if (target.closest('header')) {
        setCursorType('header');
      } else if (target.closest('footer')) {
        setCursorType('footer');
      } else if (target.closest('.hero-section')) {
        setCursorType('hero');
      } else {
        setCursorType('default');
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', updateCursorPosition);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', updateCursorPosition);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible, cursorX, cursorY, followerX, followerY]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrail((prev) => prev.slice(1));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const getCursorColor = () => {
    switch (cursorType) {
      case 'header':
        return 'rgba(45, 212, 191, 0.8)';
      case 'footer':
        return 'rgba(100, 116, 139, 0.8)';
      case 'hero':
        return 'rgba(255, 255, 255, 0.9)';
      case 'pointer':
        return 'rgba(45, 212, 191, 1)';
      default:
        return 'rgba(255, 255, 255, 0.8)';
    }
  };

  const getCursorSize = () => {
    if (cursorType === 'pointer') return { width: 48, height: 48 };
    if (cursorType === 'zoom') return { width: 40, height: 40 };
    return { width: 24, height: 24 };
  };

  const size = getCursorSize();

  return (
    <>
      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          className="fixed pointer-events-none z-[99997] rounded-full"
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            left: point.x,
            top: point.y,
            width: 8 - index * 0.5,
            height: 8 - index * 0.5,
            transform: 'translate(-50%, -50%)',
            background: getCursorColor(),
            mixBlendMode: 'screen',
          }}
        />
      ))}

      <motion.div
        className="fixed pointer-events-none z-[99999] rounded-full border-2 transition-colors duration-300"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          width: size.width,
          height: size.height,
          x: -size.width / 2,
          y: -size.height / 2,
          borderColor: getCursorColor(),
          mixBlendMode: 'difference',
        }}
      >
        {cursorType === 'pointer' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold tracking-wider"
          >
            VIEW
          </motion.div>
        )}

        {cursorType === 'shirt' && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute inset-0 flex items-center justify-center text-2xl"
          >
            👕
          </motion.div>
        )}

        {cursorType === 'pants' && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute inset-0 flex items-center justify-center text-2xl"
          >
            👖
          </motion.div>
        )}

        {cursorType === 'zoom' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center text-xl"
          >
            🔍
          </motion.div>
        )}

        {cursorType === 'sale' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center text-xl"
          >
            🔥
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="fixed pointer-events-none z-[99998] rounded-full"
        style={{
          left: followerXSpring,
          top: followerYSpring,
          width: size.width * 2,
          height: size.height * 2,
          x: -size.width,
          y: -size.height,
          background: getCursorColor(),
          opacity: 0.1,
          mixBlendMode: 'screen',
        }}
      />

      <style>{`
        * {
          cursor: none !important;
        }

        @media (max-width: 768px) {
          .fixed.z-\\[99997\\],
          .fixed.z-\\[99998\\],
          .fixed.z-\\[99999\\] {
            display: none !important;
          }
          * {
            cursor: auto !important;
          }
        }
      `}</style>
    </>
  );
}
