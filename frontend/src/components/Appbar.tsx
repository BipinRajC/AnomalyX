import { Activity, BarChart, Database, Home, Menu, Upload, X } from "lucide-react";
import { useState } from "react";

export default function Appbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigationItems = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Upload Data', icon: Upload, href: '/upload' },
    { name: 'SQL Query', icon: Database, href: '/query' },
    { name: 'Analysis', icon: BarChart, href: '/analysis' },
  ];

  return (
    <>
      <header className="bg-slate-900/50 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">AnomalyX</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-300 hover:text-white p-2"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-2">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>
    </>
  )
}
