/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        loom: {
          blue: '#1868DB',
          'blue-hover': '#1455B3',
          'blue-light': '#8FB8F6',
          charcoal: '#292A2E',
          dark: '#101214',
          purple: '#BF63F3',
          'deep-purple': '#48245D',
          orange: '#FF613D',
          warning: '#FFA900',
          'surface-blue': '#E9F2FE',
          'surface-purple': '#F8EEFE',
          'surface-light': '#EFF0FF',
          'card-highlight': '#CFE1FD',
          'border-blue': '#8FB8F6',
          'gray-dark': '#6C6F77',
          'gray-medium': '#7D818A',
          'gray-light': '#8C8F97',
        },
        dark: {
          bg: '#0A0D12',
          surface: '#12171F',
          card: '#161D27',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(56, 139, 253, 0.4)',
          text: '#F0F6FC',
          muted: '#8B949E',
        }
      },
      fontFamily: {
        display: ['"Charlie Display"', '"Plus Jakarta Sans"', 'Georgia', 'serif'],
        sans: ['"Charlie Text"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['"Charlie Text"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      borderRadius: {
        'card': '44px',
        'media': '41.69px',
        'input': '14px',
        'badge': '12px',
        'pill': '9999px',
      },
      boxShadow: {
        'loom-small': 'rgba(0, 0, 0, 0.04) 0px 2px 6px 0px, rgba(0, 0, 0, 0.06) 0px 5px 18px 0px, rgba(0, 0, 0, 0.1) 0px 24px 83px 0px',
        'loom-medium': 'rgba(0, 0, 0, 0.03) 0px 4px 6.4px 0px, rgba(0, 0, 0, 0.05) 0px 3px 9.6px 0px, rgba(0, 0, 0, 0.07) 0px 8px 32px 0px, rgba(0, 0, 0, 0.1) 0px 32px 96px 0px',
        'loom-large': 'rgba(0, 0, 0, 0.25) 0px 15px 50px 0px',
        'loom-header': 'rgba(0, 0, 0, 0.04) 0px 2px 6px 0px',
        'loom-focus': '0px 0px 0px 3px rgba(24, 104, 219, 0.12)',
        'dark-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
      },
      spacing: {
        '36': '36px',
        '44': '44px',
        '56': '56px',
        '72': '72px',
        '90': '90px',
        '92': '92px',
        '112': '112px',
      }
    },
  },
  plugins: [],
}
