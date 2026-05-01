/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                forest: '#0f2926',
                'forest-light': '#1a3d38',
                lime: '#d0f274',
                'lime-dark': '#b8db5e',
                mint: '#f4f8f1',
                'mint-dark': '#e8f0e3',
            },
            fontFamily: {
                jakarta: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                soft: '0 2px 15px rgba(15, 41, 38, 0.08)',
                card: '0 4px 24px rgba(15, 41, 38, 0.06)',
            },
            keyframes: {
                'slide-in': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'none' },
                },
            },
            animation: {
                'slide-in': 'slide-in 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
                'fade-in': 'fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            },
        },
    },
    plugins: [],
};
