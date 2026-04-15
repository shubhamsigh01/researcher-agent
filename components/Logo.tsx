"use client";
import { motion } from 'motion/react';

interface LogoProps {
  size?: number;
  isActive?: boolean;
}

export function Logo({ size = 48, isActive = false }: LogoProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 opacity-20 blur-md"
        animate={{
          scale: isActive ? [1, 1.3, 1] : 1,
          opacity: isActive ? [0.2, 0.4, 0.2] : 0.2,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Concentric circles */}
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
          style={{
            width: `${100 - index * 15}%`,
            height: `${100 - index * 15}%`,
            top: `${index * 7.5}%`,
            left: `${index * 7.5}%`,
          }}
          animate={{
            scale: isActive ? [1, 1.1, 1] : 1,
            opacity: isActive ? [0.3, 0.6, 0.3] : 0.3,
            rotate: isActive ? [0, 180, 360] : 0,
          }}
          transition={{
            duration: 3 + index,
            repeat: Infinity,
            ease: 'linear',
            delay: index * 0.2,
          }}
        />
      ))}

      {/* Core circle with gradient */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-500"
        style={{
          width: '70%',
          height: '70%',
          top: '15%',
          left: '15%',
        }}
        animate={{
          scale: isActive ? [1, 1.05, 1] : 1,
          rotate: isActive ? [0, 360] : 0,
        }}
        transition={{
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          rotate: {
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      />

      {/* Inner wave bars - like Siri visualization */}
      <div className="absolute inset-0 flex items-center justify-center gap-0.5">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            className="w-0.5 bg-white rounded-full"
            style={{
              height: `${30 + (index === 2 ? 10 : 0)}%`,
            }}
            animate={{
              height: isActive
                ? [
                    `${30 + (index === 2 ? 10 : 0)}%`,
                    `${50 + Math.random() * 20}%`,
                    `${30 + (index === 2 ? 10 : 0)}%`,
                  ]
                : `${30 + (index === 2 ? 10 : 0)}%`,
            }}
            transition={{
              duration: 0.6 + Math.random() * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.1,
            }}
          />
        ))}
      </div>

      {/* Center dot */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: isActive ? [1, 1.5, 1] : 1,
          opacity: isActive ? [1, 0.5, 1] : 1,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
