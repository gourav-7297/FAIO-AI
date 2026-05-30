/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--background))',
                surface: 'hsl(var(--card))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',   // Vibrant Coral Pink (Airbnb style)
                    light: '#FF6B8B',
                    dark: '#E01E43',
                    foreground: '#FFFFFF'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--muted))',   // Soft slate/grey
                    light: '#F8FAFC',
                    foreground: 'hsl(var(--foreground))' // Deep charcoal text
                },
                action: {
                    DEFAULT: 'hsl(var(--action))',
                    hover: '#1E293B',
                },
                accent: 'hsl(var(--primary))',
                cobalt: '#008CFF',        // Electric Cobalt Blue (MMT style)
                sage: '#10B981',          // Emerald Green (Agoda style)
                sand: '#F59E0B',          // Rating Amber Gold
                // Agent colors (high-contrast premium tones)
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
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
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
