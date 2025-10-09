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
    }, 1200); // Extended for more luxurious, deliberate transitions

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
            <div className="absolute inset-0 bg-gradient-to-br from-deep-navy/80 via-black/50 to-deep-navy/80" />

            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(159, 145, 101, 0.12) 0%, transparent 50%)', // olive-gold
                  'radial-gradient(circle at 80% 50%, rgba(125, 137, 122, 0.12) 0%, transparent 50%)', // sage-green
                  'radial-gradient(circle at 50% 80%, rgba(159, 145, 101, 0.12) 0%, transparent 50%)', // olive-gold
                  'radial-gradient(circle at 20% 50%, rgba(159, 145, 101, 0.12) 0%, transparent 50%)', // olive-gold
                ],
              }}
              transition={{
                duration: 5, // Slower, more elegant movement
                ease: [0.43, 0.13, 0.23, 0.96], // Custom easing for refined movement
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
                {/* Luxury styled logo spinner */}
                <motion.div 
                  className="w-24 h-24 relative flex items-center justify-center"
                >
                  {/* Main outer ring */}
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: [0.76, 0, 0.24, 1],
                    }}
                    className="absolute inset-0 rounded-full border-[2px] border-olive-gold/40"
                    style={{
                      boxShadow: '0 0 15px rgba(159, 145, 101, 0.2)',
                    }}
                  />
                  
                  {/* Secondary spinner */}
                  <motion.div
                    animate={{
                      rotate: -180,
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="absolute inset-[4px] rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(159, 145, 101, 0.1), transparent)',
                      border: '1px solid rgba(159, 145, 101, 0.3)',
                    }}
                  />
                  
                  {/* Center emblem */}
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: 'radial-gradient(circle, rgba(245, 243, 238, 0.1) 0%, transparent 70%)',
                      border: '1px solid rgba(159, 145, 101, 0.6)',
                    }}
                  >
                    {/* Brand initial */}
                    <span className="text-olive-gold text-xl font-cormorant font-light tracking-wider">
                      BTN
                    </span>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center space-y-2 mt-5"
              >
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: [0.33, 1, 0.68, 1] }}
                  className="text-off-white text-xs font-montserrat font-light tracking-[0.4em] uppercase"
                >
                  Curating Elegance
                </motion.span>
                <motion.div className="flex justify-center">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-olive-gold/50 to-transparent" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            key="particle-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[99999] pointer-events-none"
          >
            {/* Luxury dust particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: 0,
                  opacity: 0,
                  rotate: 0,
                }}
                animate={{
                  y: [
                    Math.random() * window.innerHeight,
                    Math.random() * window.innerHeight - 100,
                  ],
                  x: [
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerWidth - 50,
                  ],
                  scale: [0, Math.random() * 0.7 + 0.3, 0],
                  opacity: [0, 0.4, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: Math.random() * 5 + 3, // Slower, more elegant movement
                  delay: Math.random() * 0.8,
                  ease: [0.43, 0.13, 0.23, 0.96], // Luxury easing
                }}
                className="absolute"
                style={{
                  width: Math.random() * 6 + 1,
                  height: Math.random() * 6 + 1,
                  background: i % 3 === 0
                    ? 'rgba(159, 145, 101, 0.4)' // olive-gold
                    : i % 3 === 1
                      ? 'rgba(245, 243, 238, 0.4)' // off-white
                      : 'rgba(125, 137, 122, 0.4)', // sage-green
                  borderRadius: i % 2 === 0 ? '50%' : '2px', // Mix of circles and squares
                  filter: 'blur(1px)',
                  boxShadow: '0 0 4px rgba(159, 145, 101, 0.2)',
                }}
              />
            ))}
            
            {/* Decorative lines */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`line-${i}`}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scaleX: 0,
                  opacity: 0,
                }}
                animate={{
                  scaleX: [0, 1, 0],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: Math.random() * 4 + 6,
                  delay: Math.random() * 2,
                  ease: [0.645, 0.045, 0.355, 1],
                }}
                className="absolute h-[1px]"
                style={{
                  width: Math.random() * 200 + 50,
                  background: 'linear-gradient(90deg, transparent, rgba(159, 145, 101, 0.4), transparent)',
                  transformOrigin: i % 2 === 0 ? 'left' : 'right',
                }}
              />
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
