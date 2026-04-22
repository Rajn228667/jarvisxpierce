import { motion } from 'framer-motion';

export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#07070a]" />
      <div className="absolute inset-0 dot-grid opacity-[0.35]" />
      <motion.div
        className="absolute -top-40 -left-40 h-[700px] w-[700px] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(83,80,255,0.35), transparent 70%)'
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-40 -right-40 h-[650px] w-[650px] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(212,175,106,0.22), transparent 70%)'
        }}
        animate={{ x: [0, -30, 15, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/3 h-[700px] w-[700px] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(16,185,129,0.18), transparent 70%)'
        }}
        animate={{ x: [0, 20, -30, 0], y: [0, 20, 10, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#07070a]" />
    </div>
  );
}
