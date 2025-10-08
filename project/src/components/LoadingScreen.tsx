import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onLoadComplete }: { onLoadComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const words = ['Welcome', 'Loading Experience', 'Almost Ready', "Shopping with BTN 😍"];

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
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden"
    >
      <video
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.3, filter: 'blur(8px)' }}
        src="https://assets.awwwards.com/awards/element/2025/07/688b31c2a1db8974510816.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />

      <div className="relative z-10 text-center px-6">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-6xl md:text-8xl font-serif text-white mb-16 tracking-[0.15em]"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 200,
          }}
        >
          BTN CLOTHES
        </motion.h1>

        <div className="h-24 flex items-center justify-center mb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWordIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.6,
                ease: 'easeInOut',
              }}
              className="text-white text-2xl md:text-4xl tracking-[0.2em] uppercase"
              style={{
                fontWeight: 200,
                letterSpacing: '0.2em',
              }}
            >
              {words[currentWordIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-80 md:w-[500px] mx-auto space-y-4">
          <div className="h-[2px] bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-teal-400 via-blue-400 to-teal-300 rounded-full relative"
              style={{
                boxShadow: '0 0 20px rgba(45, 212, 191, 0.5)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/40 text-xs tracking-[0.3em] uppercase"
            style={{ fontWeight: 300 }}
          >
            {Math.round(progress)}%
          </motion.div>
        </div>
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
          animation: shimmer 2s infinite;
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
