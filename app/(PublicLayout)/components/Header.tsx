"use client"

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/shared/logo'
import { ModeToggle } from '@/components/shared/mode-toggle'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HeaderClient() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const linkClass = (href: string) =>
    cn(
      'inline-flex items-center h-8 leading-none text-primary hover:text-primary/90 transition-colors',
      isActive(href) && 'bg-primary/10 dark:bg-primary/20 text-primary font-semibold px-3 rounded-full'
    )

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between py-4">
        <div className="flex items-center">
          <Logo size="large" link />
        </div>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-6">
            <Link href="/" className={linkClass('/')} aria-current={isActive('/') ? 'page' : undefined}>Home</Link>
            <Link href="/about" className={linkClass('/about')} aria-current={isActive('/about') ? 'page' : undefined}>About</Link>
            <Link href="/features" className={linkClass('/features')} aria-current={isActive('/features') ? 'page' : undefined}>Features</Link>
            <Link href="/admin" className={linkClass('/admin')} aria-current={isActive('/admin') ? 'page' : undefined}>Admin</Link>
          </nav>
          <ModeToggle />
        </div>

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="p-2"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-popover/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 bg-background p-4 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <Logo size="medium" />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-4">
              <Link href="/" onClick={() => setOpen(false)} className={cn('flex items-center h-10', linkClass('/'))} aria-current={isActive('/') ? 'page' : undefined}>Home</Link>
              <Link href="/about" onClick={() => setOpen(false)} className={cn('flex items-center h-10', linkClass('/about'))} aria-current={isActive('/about') ? 'page' : undefined}>About</Link>
              <Link href="/features" onClick={() => setOpen(false)} className={cn('flex items-center h-10', linkClass('/features'))} aria-current={isActive('/features') ? 'page' : undefined}>Features</Link>
              <Link href="/admin" onClick={() => setOpen(false)} className={cn('flex items-center h-10', linkClass('/admin'))} aria-current={isActive('/admin') ? 'page' : undefined}>Admin</Link>
            </nav>

            <div className="mt-6">
              <ModeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
