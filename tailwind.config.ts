import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                panelBg: "var(--panel-bg)",
                textMain: "var(--text-main)",
                textMuted: "var(--text-muted)",
                accent: "var(--accent)",
            },
            fontFamily: {
                pixel: ['"Press Start 2P"', 'cursive'],
            },
            backgroundImage: {
                'pixel-grid': 'linear-gradient(rgba(255, 0, 127, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 127, 0.05) 1px, transparent 1px)',
            },
            backgroundSize: {
                'pixel-size': '20px 20px',
            },
            boxShadow: {
                'pixel-panel': '4px 4px 0 #000',
                'pixel-btn': 'inset -4px -4px 0 rgba(0,0,0,0.3)',
                'pixel-btn-active': 'inset -2px -2px 0 rgba(0,0,0,0.3)',
                'pixel-cup': 'inset -10px 0 0 rgba(0,0,0,0.3), 0 0 20px rgba(255, 255, 255, 0.2)',
            },
        },
    },
    plugins: [],
} satisfies Config;
