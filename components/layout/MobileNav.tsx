'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  IconHome,
  IconBook,
  IconSwords,
  IconUsers,
  IconUser,
} from '@tabler/icons-react'

const TABS = [
  { href: '/dashboard', label: 'Home', icon: IconHome },
  { href: '/guides', label: 'Guides', icon: IconBook },
  { href: '/challenge', label: 'Challenge', icon: IconSwords },
  { href: '/friends', label: 'Friends', icon: IconUsers },
  { href: '/profile', label: 'Profile', icon: IconUser },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-glass bg-bg-panel/90 backdrop-blur-xl lg:hidden">
      <div className="flex items-stretch justify-around">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors
                ${active ? 'text-accent-sky' : 'text-text-tertiary'}`}
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="absolute top-0 h-0.5 w-10 rounded-full bg-accent-sky shadow-glow-sky"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <Icon size={22} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
