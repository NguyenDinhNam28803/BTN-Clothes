import { motion, Transition } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Define a custom type for our transitions
type CustomTransition = {
  name: string;
  initial: Record<string, number | string>;
  animate: Record<string, number | string>;
  exit: Record<string, number | string>;
  transition: Transition;
};

const transitions: CustomTransition[] = [
  {
    name: 'fadeScale',
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: { duration: 0.6, ease: "easeInOut" },
  },
  {
    name: 'slideBlur',
    initial: { opacity: 0, x: 100, filter: 'blur(10px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: -100, filter: 'blur(10px)' },
    transition: { duration: 0.7, ease: "easeOut" },
  },
  {
    name: 'curtain',
    initial: { opacity: 0, y: -50, clipPath: 'inset(0 0 100% 0)' },
    animate: { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' },
    exit: { opacity: 0, y: 50, clipPath: 'inset(100% 0 0 0)' },
    transition: { duration: 0.8, ease: "easeInOut" },
  },
  
  
  
    
    
    
  {
    name: 'rotateFade',
    initial: { opacity: 0, rotate: -5, scale: 0.95 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 5, scale: 0.95 },
    transition: { duration: 0.7, ease: "backOut" },
  },
  {
    name: 'splitScreen',
    initial: { opacity: 0, scaleX: 0 },
    animate: { opacity: 1, scaleX: 1 },
    exit: { opacity: 0, scaleX: 0 },
    transition: { duration: 0.8, ease: "easeInOut" },
  },
  {
    name: 'morph',
    initial: { opacity: 0, borderRadius: '50%', scale: 0 },
    animate: { opacity: 1, borderRadius: '0%', scale: 1 },
    exit: { opacity: 0, borderRadius: '50%', scale: 0 },
    transition: { duration: 0.7, ease: "anticipate" },
  },
  {
    name: 'elasticBounce',
    initial: { opacity: 0, scale: 0.3, y: 50 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.3, y: -50 },
    transition: { duration: 0.8, ease: "circOut" },
  },
];

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const transitionIndexRef = useRef(0);
  const [currentTransition, setCurrentTransition] = useState(transitions[0]);

  useEffect(() => {
    const pathSum = location.pathname.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const index = pathSum % transitions.length;
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
      style={{ willChange: 'transform, opacity' }}
      className="w-full m-0 p-0 overflow-x-hidden"
    >
      {children}
    </motion.div>
  );
}
