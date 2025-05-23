
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

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
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ["Inter", ...fontFamily.sans],
				mono: ["JetBrains Mono", ...fontFamily.mono],
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
				},
				lovable: {
					'blue': 'hsl(var(--lovable-blue))',
					'cyan': 'hsl(var(--lovable-cyan))',
					'pink': 'hsl(var(--lovable-pink))',
					'orange': 'hsl(var(--lovable-orange))',
					'yellow': 'hsl(var(--lovable-yellow))',
					'green': 'hsl(var(--lovable-green))',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-light': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'gradient-x': {
					'0%, 100%': {
						'background-position': '0% 50%'
					},
					'50%': {
						'background-position': '100% 50%'
					}
				},
				'code-typing': {
					'0%': { width: '0%' },
					'100%': { width: '100%' }
				},
				'rotate-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'bounce-light': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'fadeIn': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fadeOut': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				'firefly-move': {
					'0%': { transform: 'translateX(0) translateY(0) scale(1)', opacity: '0' },
					'10%': { opacity: '1' },
					'50%': { transform: 'translateX(var(--x, 100px)) translateY(var(--y, -100px)) scale(0.8)', opacity: '0.8' },
					'90%': { opacity: '1' },
					'100%': { transform: 'translateX(0) translateY(0) scale(1)', opacity: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'pulse-light': 'pulse-light 3s infinite',
				'gradient-x': 'gradient-x 15s ease infinite',
				'code-typing': 'code-typing 3.5s steps(40, end)',
				'rotate-slow': 'rotate-slow 10s linear infinite',
				'bounce-light': 'bounce-light 2s infinite',
				'fadeIn': 'fadeIn 0.3s ease-in',
				'fadeOut': 'fadeOut 0.3s ease-out',
				'firefly-move': 'firefly-move 8s ease-in-out infinite',
			},
			backgroundImage: {
				'hero-pattern': 'url("/public/lovable-uploads/06acdeaf-a713-4982-8124-c68c0b3ea6ae.png")',
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'lovable-gradient': 'linear-gradient(45deg, #2780E3, #0EA5E9)',
				'lovable-dark': 'linear-gradient(to bottom, #0D0F13, #161822)',
				'lovable-hero': 'linear-gradient(to bottom, rgba(13, 15, 19, 0.9), rgba(13, 15, 19, 0.7))',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
