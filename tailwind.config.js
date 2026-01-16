/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./renderer.js"],
  theme: {
    extend: {
      colors: {
        // Premium Dark Palette (Hue 220 - Saturation 15-25%)
        'app-bg': '#0f172a', // Deep Blue-Gray
        'glass-panel': 'rgba(30, 41, 59, 0.7)', // Slate 800 with opacity
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        
        // Vibrancy
        'primary': '#3b82f6', // Blue 500
        'primary-glow': 'rgba(59, 130, 246, 0.5)',
        
        // Status with glow potential
        'success': '#10b981', // Emerald 500
        'error': '#ef4444',   // Red 500
        'text-main': '#f8fafc', // Slate 50
        'text-muted': '#94a3b8', // Slate 400
      },
      fontFamily: {
        sans: [
          'Inter', 
          'ui-sans-serif', 
          'system-ui', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'Helvetica Neue', 
          'Arial', 
          'sans-serif'
        ],
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.1)' },
          '50%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' },
        }
      }
    },
  },
  plugins: [],
}
