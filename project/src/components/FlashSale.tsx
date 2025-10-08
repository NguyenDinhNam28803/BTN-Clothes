import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FlashSaleProps {
  endDate: Date;
  title?: string;
}

const FlashSale: React.FC<FlashSaleProps> = ({ 
  endDate, 
  title = 'Flash Sale Ends In' 
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsActive(false);
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    // Calculate initial time left
    setTimeLeft(calculateTimeLeft());

    // Update time every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [endDate]);

  if (!isActive) {
    return <div className="text-center py-4">The flash sale has ended!</div>;
  }

  return (
    <div className="bg-red-600 text-white py-4 px-6 rounded-lg shadow-md">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="flex justify-center space-x-4">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>
    </div>
  );
};

interface TimeUnitProps {
  value: number;
  label: string;
}

const TimeUnit: React.FC<TimeUnitProps> = ({ value, label }) => {
  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="bg-white text-red-600 font-bold rounded-md w-16 h-16 flex items-center justify-center text-xl sm:text-2xl"
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {value.toString().padStart(2, '0')}
      </motion.div>
      <span className="text-xs mt-1">{label}</span>
    </motion.div>
  );
};

export default FlashSale;