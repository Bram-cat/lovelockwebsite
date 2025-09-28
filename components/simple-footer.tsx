'use client'

import { Heart, Mail, Github, Instagram } from 'lucide-react'

// Reddit icon component (since lucide-react doesn't have a built-in Reddit icon)
function RedditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  )
}

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
                href="https://www.reddit.com/r/Lovelock/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Join our Reddit community"
              >
                <RedditIcon className="w-5 h-5 text-white" />
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
              <p className="text-gray-400 text-xs">Follow us for cosmic insights & join our Reddit community</p>
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