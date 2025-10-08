import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function TransitionLoader() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  useEffect(() => {
    setHasLoadedInitially(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedInitially) return;

    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 900);

    return () => clearTimeout(timer);
  }, [location.pathname, hasLoadedInitially]);

  return (
    <AnimatePresence mode="wait">
      {isTransitioning && (
        <>
          <motion.div
            key="loader-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100000]"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40" />

            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(45, 212, 191, 0.15) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 80%, rgba(45, 212, 191, 0.15) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(45, 212, 191, 0.15) 0%, transparent 50%)',
                ],
              }}
              transition={{
                duration: 3,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
            />

            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)]" />
            </div>
          </motion.div>

          <motion.div
            key="loader-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="fixed inset-0 z-[100001] flex items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center space-y-8">
              <motion.div className="relative">
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="w-20 h-20 rounded-full border-[3px] border-transparent"
                  style={{
                    borderTopColor: 'rgba(45, 212, 191, 0.8)',
                    borderRightColor: 'rgba(45, 212, 191, 0.4)',
                  }}
                />
                <motion.div
                  animate={{
                    rotate: -360,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute inset-2 rounded-full border-[3px] border-transparent"
                  style={{
                    borderBottomColor: 'rgba(14, 165, 233, 0.6)',
                    borderLeftColor: 'rgba(14, 165, 233, 0.3)',
                  }}
                />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400/20 to-cyan-400/20"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-2"
              >
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-white/90 text-sm font-light tracking-[0.3em] uppercase"
                >
                  Loading
                </motion.span>
                <motion.div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: 'easeInOut',
                      }}
                      className="text-white/90 text-sm"
                    >
                      .
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            key="particle-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[99999] pointer-events-none"
          >
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  y: [
                    Math.random() * window.innerHeight,
                    Math.random() * window.innerHeight,
                  ],
                  x: [
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerWidth,
                  ],
                  scale: [0, Math.random() * 1.5 + 0.5, 0],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeInOut',
                }}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 4 + 1,
                  height: Math.random() * 4 + 1,
                  background: `radial-gradient(circle, ${
                    i % 2 === 0
                      ? 'rgba(45, 212, 191, 0.6)'
                      : 'rgba(14, 165, 233, 0.6)'
                  } 0%, transparent 70%)`,
                  filter: 'blur(1px)',
                }}
              />
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
