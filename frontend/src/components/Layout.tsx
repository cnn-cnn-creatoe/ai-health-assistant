import { ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AppIcon } from './AppIcon'
import { Bell, FileText, LayoutDashboard, MessagesSquare, Settings } from 'lucide-react'
import { getUnreadCount } from '../services/notificationsStore'
import { Moon, Sun } from 'lucide-react'
import { start as startMedicationReminders } from '../services/medicationReminders'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [unreadCount, setUnreadCount] = useState(() => getUnreadCount())
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = window.localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const update = () => setUnreadCount(getUnreadCount())
    update()
    window.addEventListener('notifications:changed', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('notifications:changed', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  useEffect(() => {
    startMedicationReminders()
  }, [])

  const navItems = [
    { path: '/dashboard', label: '首页', icon: LayoutDashboard },
    { path: '/chat', label: '健康助手', icon: MessagesSquare },
    { path: '/records', label: '健康档案', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-sm border-gray-200 shadow-sm' : 'bg-white border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <AppIcon className="w-9 h-9" />
              <div className="leading-tight">
                <span className="block text-[15px] font-semibold text-gray-900">健康助手</span>
                <span className="block text-xs text-gray-500">个人健康管理</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </span>
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="通知中心"
              >
                <Bell className="w-5 h-5" />
                {unreadCount ? (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold leading-none text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                ) : null}
              </Link>
              <Link
                to="/profile"
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="个人资料与设置"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="切换主题"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">{children}</main>
    </div>
  )
}
