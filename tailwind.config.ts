import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sale: {
  				coupang: 'hsl(var(--sale-coupang))',
  				oliveyoung: 'hsl(var(--sale-oliveyoung))',
  				musinsa: 'hsl(var(--sale-musinsa))',
  				kream: 'hsl(var(--sale-kream))',
  				ssg: 'hsl(var(--sale-ssg))',
  				ohouse: 'hsl(var(--sale-ohouse))',
  				'29cm': 'hsl(var(--sale-29cm))',
  				community: 'hsl(var(--sale-community))',
  				wconcept: 'hsl(var(--sale-wconcept))'
  			},
  			'closing-today': {
  				DEFAULT: 'hsl(var(--closing-today))',
  				bg: 'hsl(var(--closing-today-bg))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 4px)',
  			sm: 'calc(var(--radius) - 8px)'
  		},
  		boxShadow: {
  			card: 'var(--shadow-card)',
  			'card-hover': 'var(--shadow-card-hover)',
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(8px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'closing-pulse': {
  				'0%, 100%': {
  					transform: 'scale(0.8)',
  					opacity: '0.4',
  					boxShadow: '0 0 0 rgba(0,0,0,0)'
  				},
  				'50%': {
  					transform: 'scale(1.2)',
  					opacity: '1',
  					boxShadow: '0 0 4px hsl(var(--closing-today) / 0.4)'
  				}
  			},
			'pulse-green': {
				'0%, 100%': {
					transform: 'scale(1)',
					opacity: '1'
				},
				'50%': {
					transform: 'scale(1.4)',
					opacity: '0.6'
				}
			}
		},
		animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
			'fade-in': 'fade-in 0.4s ease-out forwards',
			'closing-pulse': 'closing-pulse 1.5s ease-in-out infinite',
			'pulse-green': 'pulse-green 1.5s infinite'
		},
		fontFamily: {
			sans: [
				'Noto Sans KR',
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
			display: [
				'Playfair Display',
				'serif'
			],
			serif: [
				'Playfair Display',
				'serif'
			],
			mono: [
				'ui-monospace',
				'SFMono-Regular',
				'Menlo',
				'Monaco',
				'Consolas',
				'Liberation Mono',
				'Courier New',
				'monospace'
			]
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
