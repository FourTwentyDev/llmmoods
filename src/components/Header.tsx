'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, BarChart3, GitCompare, Github, Code2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'

interface HeaderProps {
  showBackButton?: boolean
  backButtonText?: string
  backButtonHref?: string
  title?: string
  subtitle?: string
}

export default function Header({
  showBackButton = true,
  backButtonText = 'Back to home',
  backButtonHref = '/',
  title,
  subtitle
}: HeaderProps) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  const navLinks = [
    { href: '/compare', label: 'Compare', icon: GitCompare },
    { href: '/stats', label: 'Stats', icon: BarChart3 },
    { href: '/api-docs', label: 'API', icon: Code2 },
  ]

  return (
    <header className="bg-card border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isHomePage && showBackButton && (
              <Link
                href={backButtonHref}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                aria-label={backButtonText}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            
            <Link href="/" className="block">
              <Image 
                src="/logo.webp" 
                alt="LLM Mood Tracker Logo" 
                width={64} 
                height={64} 
                className="rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
              />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {title || 'LLM Mood Tracker'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {subtitle || "How's your AI feeling today?"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            
            <a
              href="https://github.com/llmmoods/https://github.com/FourTwentyDev/llmmoods"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Github className="w-5 h-5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}