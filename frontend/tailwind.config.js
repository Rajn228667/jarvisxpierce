/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07070a',
          900: '#0a0a0b',
          850: '#0f0f11',
          800: '#15151a',
          700: '#1a1a20',
          600: '#22222a',
          500: '#2b2b34',
          400: '#3a3a45'
        },
        brand: {
          50: '#f5f5ff',
          100: '#e8e8ff',
          200: '#c5c5ff',
          300: '#9898ff',
          400: '#7070ff',
          500: '#5350ff',
          600: '#3d3af0',
          700: '#2d2ac0',
          800: '#23218a',
          900: '#15143f'
        },
        accent: {
          gold: '#d4af6a',
          emerald: '#10b981',
          crimson: '#ef4444',
          amber: '#f59e0b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glass: '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px -20px rgba(0,0,0,0.7)',
        glow: '0 0 60px -20px rgba(83,80,255,0.55)',
        sink: '0 -1px 0 rgba(255,255,255,0.03) inset'
      },
      backgroundImage: {
        'grid-lines':
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'radial-luxe':
          'radial-gradient(1200px 600px at 20% -10%, rgba(83,80,255,0.14), transparent 60%), radial-gradient(900px 500px at 100% 10%, rgba(212,175,106,0.08), transparent 60%), radial-gradient(800px 500px at 50% 120%, rgba(16,185,129,0.08), transparent 60%)'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' }
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        aurora: {
          '0%, 100%': { transform: 'translate3d(0,0,0) rotate(0deg)' },
          '50%': { transform: 'translate3d(2%,1%,0) rotate(6deg)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        aurora: 'aurora 18s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
