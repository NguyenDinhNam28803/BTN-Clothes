import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const transitions = [
  {
    name: 'fadeScale',
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] },
  },
  {
    name: 'slideBlur',
    initial: { opacity: 0, x: 100, filter: 'blur(10px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: -100, filter: 'blur(10px)' },
    transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
  },
  {
    name: 'curtain',
    initial: { opacity: 0, y: -50, clipPath: 'inset(0 0 100% 0)' },
    animate: { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' },
    exit: { opacity: 0, y: 50, clipPath: 'inset(100% 0 0 0)' },
    transition: { duration: 0.8, ease: [0.87, 0, 0.13, 1] },
  },
  {
    name: 'zoomBlur',
    initial: { opacity: 0, scale: 0.8, filter: 'blur(20px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.2, filter: 'blur(20px)' },
    transition: { duration: 0.7, ease: [0.6, 0.01, 0.05, 0.95] },
  },
  {
    name: 'rotateFade',
    initial: { opacity: 0, rotate: -5, scale: 0.95 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 5, scale: 0.95 },
    transition: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] },
  },
  {
    name: 'splitScreen',
    initial: { opacity: 0, scaleX: 0 },
    animate: { opacity: 1, scaleX: 1 },
    exit: { opacity: 0, scaleX: 0 },
    transition: { duration: 0.8, ease: [0.87, 0, 0.13, 1] },
  },
  {
    name: 'morph',
    initial: { opacity: 0, borderRadius: '50%', scale: 0 },
    animate: { opacity: 1, borderRadius: '0%', scale: 1 },
    exit: { opacity: 0, borderRadius: '50%', scale: 0 },
    transition: { duration: 0.7, ease: [0.68, -0.55, 0.265, 1.55] },
  },
  {
    name: 'elasticBounce',
    initial: { opacity: 0, scale: 0.3, y: 50 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.3, y: -50 },
    transition: { duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] },
  },
];

let transitionIndex = 0;

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const [currentTransition, setCurrentTransition] = useState(transitions[0]);

  useEffect(() => {
    transitionIndex = (transitionIndex + 1) % transitions.length;
    setCurrentTransition(transitions[transitionIndex]);
  }, [children]);

  return (
    <motion.div
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
