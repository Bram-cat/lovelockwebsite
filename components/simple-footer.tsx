'use client'

import { Heart, Mail, Github, Instagram } from 'lucide-react'

export function SimpleFooter() {
  return (
    <footer className="relative z-10 px-6 py-12 border-t border-white/10 bg-black/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Lovelock</span>
            </div>
            <p className="text-gray-400 text-sm">
              Unlock hidden secrets about yourself and others through ancient numerology and modern psychology.
            </p>
          </div>

          {/* Features */}
          <div className="md:col-span-1">
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li><a href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">Numerology Readings</a></li>
              <li><a href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">Love Compatibility</a></li>
              <li><a href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">Trust Assessment</a></li>
              <li><a href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">AI Insights</a></li>
              <li><a href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-1">
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">Help Center</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
              <li><a href="mailto:lovelock.bugs@gmail.com" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</a></li>
              <li><a href="/account" className="text-gray-400 hover:text-white transition-colors text-sm">Account Settings</a></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="md:col-span-1">
            <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
            <div className="flex gap-3 mb-4">
              <a
                href="https://www.instagram.com/lovelock_it/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://github.com/lovelock-app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-gray-900 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="View our code on GitHub"
              >
                <Github className="w-5 h-5 text-white" />
              </a>
              <a
                href="mailto:lovelock.bugs@gmail.com"
                className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Contact us via email"
              >
                <Mail className="w-5 h-5 text-white" />
              </a>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">lovelock.bugs@gmail.com</p>
              <p className="text-gray-400 text-xs">Follow us for cosmic insights & updates</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 Lovelock. All rights reserved.
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="mailto:lovelock.bugs@gmail.com" className="hover:text-white transition-colors">Support</a>
            </div>
            <span className="flex items-center">
              Made with <Heart className="w-4 h-4 mx-1 text-pink-400" /> for cosmic souls
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}