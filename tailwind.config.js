/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#FAFAF8',
                surface: '#FFFFFF',
                primary: {
                    DEFAULT: '#C2785C',   // Warm terracotta
                    light: '#D49A82',     // Lighter terracotta
                    dark: '#A8624A',      // Darker terracotta
                    foreground: '#FFFFFF'
                },
                secondary: {
                    DEFAULT: '#9C958D',   // Warm muted gray for secondary text
                    light: '#F5F2EE',     // Warm off-white for backgrounds
                    foreground: '#3D3632' // Warm charcoal text
                },
                action: {
                    DEFAULT: '#3D3632',   // Warm charcoal for primary actions
                    hover: '#524B46',
                },
                accent: '#C2785C',        // Same as primary
                sage: '#8BAA8D',          // Muted green
                sand: '#E0D5C5',          // Sand/beige
                warmgray: '#A09890',      // Warm muted gray
                // Agent colors (muted warm tones)
                agent: {
                    itinerary: '#6B8FAD',   // Muted steel blue
                    liveUpdate: '#C4944A',  // Muted gold
                    localSecrets: '#8B7BAD', // Muted purple
                    budget: '#7BA47E',      // Muted sage
                    safety: '#C47070',      // Muted rose
                    sustainability: '#6BA3A3', // Muted teal
                }
            },
            fontFamily: {
                sans: ['"Inter"', 'sans-serif'],
                heading: ['"Outfit"', 'sans-serif'],
            },
            animation: {
                'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'fade-in': 'fadeIn 0.2s ease-out',
                'float': 'float 4s ease-in-out infinite',
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
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-6px)' },
                }
            },
            boxShadow: {
                'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
                'card-hover': '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
                'nav': '0 -2px 20px rgba(0,0,0,0.06)',
            },
            borderRadius: {
                '3xl': '1.5rem',
                '4xl': '2rem',
            }
        },
    },
    plugins: [],
}
