/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#020617', // Deepest slate
                surface: '#0F172A', // Slightly lighter
                primary: {
                    DEFAULT: '#F8FAFC', // Off-white
                    foreground: '#020617'
                },
                secondary: {
                    DEFAULT: '#94A3B8', // Muted slate
                    foreground: '#F8FAFC'
                },
                action: {
                    DEFAULT: '#3B82F6', // Azure Blue
                    hover: '#2563EB',
                },
                safety: '#EF4444', // Sunset Red
                accent: '#8B5CF6', // Violet for premium feel
                // Agent colors
                agent: {
                    itinerary: '#3B82F6',
                    liveUpdate: '#F59E0B',
                    localSecrets: '#8B5CF6',
                    budget: '#10B981',
                    safety: '#EF4444',
                    sustainability: '#06B6D4',
                }
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
                heading: ['"Outfit"', 'sans-serif'],
            },
            animation: {
                'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'fade-in': 'fadeIn 0.2s ease-out',
                'shimmer': 'shimmer 2s infinite',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                slideUp: {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
