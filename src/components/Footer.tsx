'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Twitter, Instagram, Youtube, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto transition-all">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent inline-block mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              NuttyFans
            </Link>
            <p className="text-sm font-normal text-[#4a5565] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Empowering creators to build meaningful connections with their audience.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#101828] tracking-wider uppercase mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/creators" className="text-sm font-normal text-[#4a5565] hover:text-[#9810fa] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                  For Creators
                </Link>
              </li>
              <li>
                <Link href="/discover" className="text-sm font-normal text-[#4a5565] hover:text-[#9810fa] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                  For Fans
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm font-normal text-[#4a5565] hover:text-[#9810fa] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-sm font-normal text-[#4a5565] hover:text-[#9810fa] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#101828] tracking-wider uppercase mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm font-normal text-[#4a5565] hover:text-[#9810fa] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm font-normal text-[#4a5565] hover:text-[#9810fa] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Community
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm font-normal text-[#4a5565] hover:text-[#9810fa] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-sm font-normal text-[#4a5565] hover:text-[#9810fa] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Creator Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#101828] tracking-wider uppercase mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm font-normal text-[#4a5565] hover:text-[#9810fa] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm font-normal text-[#4a5565] hover:text-[#9810fa] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm font-normal text-[#4a5565] hover:text-[#9810fa] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm font-normal text-[#4a5565] hover:text-[#9810fa] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm font-normal text-[#4a5565] text-center md:text-left mb-4 md:mb-0" style={{ fontFamily: 'Inter, sans-serif' }}>
            &copy; {new Date().getFullYear()} NuttyFans. All rights reserved.
          </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4a5565] hover:text-[#9810fa] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4a5565] hover:text-[#9810fa] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4a5565] hover:text-[#9810fa] transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4a5565] hover:text-[#9810fa] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
