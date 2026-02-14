'use client';

import Link from 'next/link';
import { Twitter, Instagram, Youtube, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer 
      className="mt-auto transition-all"
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
      }}
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link 
              href="/" 
              className="inline-block mb-4"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '24px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              NuttyFans
            </Link>
            <p 
              className="leading-relaxed"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#4A5565'
              }}
            >
              Empowering creators to build meaningful connections with their audience.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 
              className="tracking-wider uppercase mb-4"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#101828'
              }}
            >
              Platform
            </h3>
            <ul className="space-y-2">
              {['For Creators', 'For Fans', 'Pricing', 'Features'].map((label, idx) => {
                const hrefs = ['/creators', '/discover', '/pricing', '/features'];
                return (
                  <li key={idx}>
                    <Link 
                      href={hrefs[idx]}
                      className="transition-colors"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#4A5565'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#9810FA'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#4A5565'}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 
              className="tracking-wider uppercase mb-4"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#101828'
              }}
            >
              Resources
            </h3>
            <ul className="space-y-2">
              {['Help Center', 'Community', 'Blog', 'Creator Guide'].map((label, idx) => {
                const hrefs = ['/help', '/community', '/blog', '/guide'];
                return (
                  <li key={idx}>
                    <Link 
                      href={hrefs[idx]}
                      className="transition-colors"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#4A5565'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#9810FA'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#4A5565'}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link 
                  href="mailto:support@nuttyfans.com" 
                  className="transition-colors flex items-center gap-2"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#9810FA'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#8200DB'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9810FA'}
                >
                  <span 
                    className="rounded-full"
                    style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#9810FA'
                    }}
                  ></span>
                  Need Help?
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 
              className="tracking-wider uppercase mb-4"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#101828'
              }}
            >
              Legal
            </h3>
            <ul className="space-y-2">
              {['About', 'Privacy Policy', 'Terms of Service', 'Contact'].map((label, idx) => {
                const hrefs = ['/about', '/privacy', '/terms', '/contact'];
                return (
                  <li key={idx}>
                    <Link 
                      href={hrefs[idx]}
                      className="transition-colors"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#4A5565'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#9810FA'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#4A5565'}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div 
          className="mt-12 pt-8"
          style={{ borderTop: '1px solid #E5E7EB' }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p 
              className="text-center md:text-left mb-4 md:mb-0"
              style={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#4A5565'
              }}
            >
              &copy; {new Date().getFullYear()} NuttyFans. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              {[
                { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                { Icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
                { Icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{
                    color: '#4A5565',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#9810FA'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#4A5565'}
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
