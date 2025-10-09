import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onLoadComplete }: { onLoadComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const words = ['Welcome', 'Luxury Awaits', 'Refined Elegance', 'BTN Clothes'];

  useEffect(() => {
    const duration = 4000;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onLoadComplete, 800);
          return 100;
        }
        return prev + (100 / (duration / 50));
      });
    }, 50);

    const wordDuration = 1400;
    const wordInterval = setInterval(() => {
      setCurrentWordIndex((prev) => {
        if (prev >= words.length - 1) {
          clearInterval(wordInterval);
          return prev;
        }
        return prev + 1;
      });
    }, wordDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(wordInterval);
    };
  }, [onLoadComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.645, 0.045, 0.355, 1] }}
      className="fixed inset-0 z-[10000] bg-deep-navy flex items-center justify-center overflow-hidden"
    >
      {/* Background video - use your BTN.mp4 file here or keep the placeholder */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2 }}
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.4, filter: 'blur(4px) brightness(0.7) contrast(1.1)' }}
          src="/src/Assets/IMG/BTN.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-br from-deep-navy/90 via-black/80 to-deep-navy/90" />
      
      {/* Luxury pattern overlay */}
      <div className="absolute inset-0 opacity-30" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 50L0 50 M50 50L100 50 M50 50L50 0 M50 50L50 100' stroke='%239F9165' stroke-width='0.5' fill='none' stroke-opacity='0.15'/%3E%3C/svg%3E")`,
             backgroundSize: '30px 30px'
           }}
      />

      <div className="relative z-10 text-center px-6">
        {/* Luxury brand presentation */}
        <div className="relative z-10">
          {/* Decorative element */}
          <motion.div 
            className="w-[120px] h-[1px] bg-gradient-to-r from-transparent via-olive-gold/60 to-transparent mx-auto mb-8"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "120px", opacity: 1 }}
            transition={{ delay: 0.3, duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          />
          
          {/* Main brand title */}
          <motion.h1
            initial={{ opacity: 0, letterSpacing: "0.05em" }}
            animate={{ opacity: 1, letterSpacing: "0.25em" }}
            transition={{ duration: 1.8, ease: [0.215, 0.61, 0.355, 1], delay: 0.4 }}
            className="text-6xl md:text-7xl font-cormorant text-off-white mb-8 uppercase tracking-[0.25em] font-light text-center"
          >
            BTN <span className="inline-block mx-2 text-olive-gold">·</span> CLOTHES
          </motion.h1>
          
          {/* Luxury tagline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-off-white/70 text-sm font-montserrat tracking-[0.4em] uppercase text-center mb-20 font-light"
          >
            Luxury Essentials
          </motion.div>
        </div>

        <div className="h-24 flex items-center justify-center mb-12 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWordIndex}
              initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(5px)" }}
              transition={{
                duration: 1,
                ease: [0.43, 0.13, 0.23, 0.96],
              }}
              className="text-olive-gold text-xl md:text-3xl tracking-[0.3em] font-montserrat uppercase font-light"
            >
              {words[currentWordIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-80 md:w-[400px] mx-auto space-y-6">
          {/* Elegant progress bar */}
          <div className="relative h-[1px] bg-off-white/10 backdrop-blur-sm overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="h-full bg-gradient-to-r from-olive-gold/40 via-olive-gold to-olive-gold/40 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-off-white/30 to-transparent animate-shimmer" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-off-white/50 text-xs font-montserrat tracking-[0.3em] uppercase text-center"
          >
            {Math.round(progress)}%
          </motion.div>
        </div>
      </div>

      {/* Luxury animated particles */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight - 100,
              ],
              scale: [0, Math.random() * 0.4 + 0.1, 0],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 3,
              repeat: Infinity,
              repeatType: "loop",
              ease: [0.43, 0.13, 0.23, 0.96],
            }}
            className="absolute bg-olive-gold/30 rounded-full"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              filter: "blur(1px)",
              boxShadow: "0 0 4px rgba(159, 145, 101, 0.2)",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s cubic-bezier(0.43, 0.13, 0.23, 0.96) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </motion.div>
  );
}
