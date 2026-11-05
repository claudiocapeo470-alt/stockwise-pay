import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1440px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Geist', 'Inter', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'xs': ['12px', { lineHeight: '1.5' }],
				'sm': ['13px', { lineHeight: '1.5' }],
				'base': ['14px', { lineHeight: '1.5' }],
				'lg': ['16px', { lineHeight: '1.5' }],
				'xl': ['18px', { lineHeight: '1.4' }],
				'2xl': ['20px', { lineHeight: '1.3' }],
				'3xl': ['24px', { lineHeight: '1.2' }],
				'4xl': ['32px', { lineHeight: '1.2' }],
			},
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
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
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
			spacing: {
				'xs': '4px',
				'sm': '8px',
				'md': '16px',
				'lg': '24px',
				'xl': '32px',
				'2xl': '48px',
				'3xl': '64px',
				'4xl': '96px',
			},
			borderRadius: {
				sm: '4px',
				md: '8px',
				lg: '12px',
				xl: '14px',
				'2xl': '16px',
				'3xl': '20px',
				DEFAULT: '8px',
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'medium': 'var(--shadow-medium)',
				'large': 'var(--shadow-large)',
			},
			backgroundImage: {
				'brand-gradient': 'linear-gradient(135deg, #3B5BFF 0%, #1B2FB5 100%)',
			},
			keyframes: {
				rise: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1' } },
				draw: { from: { strokeDashoffset: '1' }, to: { strokeDashoffset: '0' } },
				fade: { from: { opacity: '0' }, to: { opacity: '1' } },
				grow: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
				pop: { '0%': { transform: 'scale(.4)', opacity: '0' }, '60%': { transform: 'scale(1.1)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
				slide: { from: { opacity: '0', transform: 'translateX(14px)' }, to: { opacity: '1' } },
				shine: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
				ping2: { '0%': { boxShadow: '0 0 0 0 rgba(229,72,77,.55)' }, '100%': { boxShadow: '0 0 0 10px rgba(229,72,77,0)' } },
				float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(8px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					from: { opacity: '0', transform: 'scale(0.98)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},
				'slide-up': {
					from: { opacity: '0', transform: 'translateY(16px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-up': 'slide-up 0.35s ease-out',
				rise: 'rise .55s cubic-bezier(.2,.7,.2,1) both',
				draw: 'draw 1.6s cubic-bezier(.4,0,.2,1) .35s both',
				fade: 'fade 1s ease .9s both',
				grow: 'grow .9s cubic-bezier(.2,.7,.2,1) .5s both',
				pop: 'pop .35s cubic-bezier(.3,1.4,.5,1) both',
				slide: 'slide .3s ease both',
				shine: 'shine 4s linear infinite',
				ping2: 'ping2 1.8s infinite',
				float: 'float 4s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
