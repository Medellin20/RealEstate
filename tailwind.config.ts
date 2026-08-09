import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette "Real Estate NL" — inspirée des canaux et façades en brique des Pays-Bas.
        ink: {
          DEFAULT: '#14232B',
          50: '#EEF2F3',
          100: '#D6DFE2',
          200: '#AFC0C6',
          300: '#87A1A9',
          400: '#5E828C',
          500: '#3D636E',
          600: '#2A4A54',
          700: '#1B3A4B', // bleu Delft — couleur primaire
          800: '#152C38',
          900: '#0E1D25',
          950: '#0A1418',
        },
        canal: {
          DEFAULT: '#2F5D50',
          50: '#EBF3F0',
          100: '#D2E5DE',
          200: '#A6CBBC',
          300: '#79B199',
          400: '#529279',
          500: '#3C7660',
          600: '#2F5D50', // vert canal — couleur secondaire
          700: '#254A41',
          800: '#1B3730',
          900: '#12241F',
        },
        brick: {
          DEFAULT: '#A8462D',
          50: '#FBEEE8',
          100: '#F4D5C6',
          200: '#E8AC8F',
          300: '#DB8258',
          400: '#C15F38',
          500: '#A8462D', // accent brique — CTA, alertes positives
          600: '#8A3823',
          700: '#6B2B1B',
          800: '#4D1E13',
        },
        sand: {
          DEFAULT: '#F6F3EC',
          50: '#FFFFFF',
          100: '#F6F3EC', // fond principal
          200: '#EDE7D8',
          300: '#E1D8C1',
        },
        status: {
          available: '#3C7660',
          reserved: '#B8862E',
          rented: '#6B7280',
          draft: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['var(--font-open-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-sm': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.14em', fontWeight: '600' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(20,35,43,0.08), 0 1px 2px -1px rgba(20,35,43,0.06)',
        card: '0 4px 16px -4px rgba(20,35,43,0.10), 0 2px 6px -2px rgba(20,35,43,0.06)',
        lifted: '0 20px 40px -12px rgba(20,35,43,0.22)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      backgroundImage: {
        'canal-line':
          'linear-gradient(90deg, transparent, rgba(27,58,75,0.18) 20%, rgba(27,58,75,0.18) 80%, transparent)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
