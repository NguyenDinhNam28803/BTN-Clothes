import { motion, Transition, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

type CustomTransition = {
  name: string;
  initial: Record<string, number | string>;
  animate: Record<string, number | string>;
  exit: Record<string, number | string>;
  transition: Transition;
};

const transitions: CustomTransition[] = [
  {
    name: 'elegantFade',
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
  {
    name: 'luxuryReveal',
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
    transition: { 
      duration: 1.2, 
      ease: [0.33, 1, 0.68, 1],
      opacity: { duration: 0.8 }
    },
  },
  {
    name: 'silkCurtain',
    initial: { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
    animate: { opacity: 1, clipPath: 'inset(0 0 0% 0)' },
    exit: { opacity: 0, clipPath: 'inset(100% 0 0 0)' },
    transition: { duration: 1.3, ease: [0.76, 0, 0.24, 1] },
  },
  {
    name: 'goldenRise',
    initial: { opacity: 0, scale: 0.98, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: 20 },
    transition: { 
      duration: 1.1, 
      ease: [0.215, 0.61, 0.355, 1],
      scale: { duration: 1.2 }
    },
  },
  {
    name: 'subtleSlide',
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { 
      duration: 1, 
      ease: [0.43, 0.13, 0.23, 0.96],
      opacity: { duration: 0.7 }
    },
  },
  {
    name: 'depthReveal',
    initial: { opacity: 0, filter: 'blur(8px)', scale: 0.97 },
    animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
    exit: { opacity: 0, filter: 'blur(8px)', scale: 1.03 },
    transition: { 
      duration: 1.2, 
      ease: [0.645, 0.045, 0.355, 1],
      filter: { duration: 0.9 }
    },
  },
  {
    name: 'staggeredEntrance',
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { 
      duration: 1, 
      ease: [0.25, 0.1, 0.25, 1],
      opacity: { duration: 0.7 }
    },
  },
];

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const transitionIndexRef = useRef(0);
  const [currentTransition, setCurrentTransition] = useState(transitions[0]);

  useEffect(() => {
    // Determine the appropriate transition based on the route
    
    // Create a more consistent transition feel based on page type instead of random
    let index;
    if (location.pathname === '/' || location.pathname === '/home') {
      // Use elegant fade for home page
      index = 0; 
    } else if (location.pathname.includes('/product/')) {
      // Use depth reveal for product pages
      index = 5; 
    } else if (location.pathname.includes('/shop')) {
      // Use subtle slide for shop pages
      index = 4;
    } else if (location.pathname.includes('/cart') || location.pathname.includes('/checkout')) {
      // Use golden rise for checkout flow
      index = 3;
    } else {
      // For other pages, use a deterministic but varied approach
      const pathSum = location.pathname.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      index = pathSum % transitions.length;
    }
    
    transitionIndexRef.current = index;
    setCurrentTransition(transitions[index]);
  }, [location.pathname]);

  return (
    <motion.div
      key={location.pathname}
      initial={currentTransition.initial}
      animate={currentTransition.animate}
      exit={currentTransition.exit}
      transition={currentTransition.transition}
      style={{ 
        willChange: 'transform, opacity, filter',
        transformOrigin: 'center center'
      }}
      className="w-full m-0 p-0 overflow-x-hidden"
    >
      {children}
    </motion.div>
  );
}
