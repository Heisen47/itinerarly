import React from 'react';
import Link from 'next/link';
import {
  Twitter,
  Github,
  Linkedin,
  Mail,
  MessageSquare,
  MapPin,
  ExternalLink,
  Heart,
  Sparkles,
  Compass,
  Info
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Plan Trip', href: '/start' },
  ];

  const socialLinks = [
    { 
      icon: Twitter, 
      href: 'https://x.com/iWriteCode__', 
      label: 'Twitter',
      color: 'hover:text-blue-400 hover:border-blue-400/50'
    },
    { 
      icon: Github, 
      href: 'https://github.com/heisen47', 
      label: 'GitHub',
      color: 'hover:text-purple-400 hover:border-purple-400/50'
    },
    { 
      icon: Linkedin, 
      href: 'https://www.linkedin.com/in/saptarshi-chakraborty-3031999march/', 
      label: 'LinkedIn',
      color: 'hover:text-blue-500 hover:border-blue-500/50'
    },
    // { 
    //   icon: Mail, 
    //   href: 'mailto:contact@itinerarly.com', 
    //   label: 'Email',
    //   color: 'hover:text-orange-400 hover:border-orange-400/50'
    // },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-black/95 via-black/90 to-black text-white border-t border-white/10 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
          {/* About Section */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <Compass className="w-8 h-8 text-orange-400" />
              <h3 className="text-2xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-green-400">
                  Itinerarly
                </span>
              </h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Your intelligent travel companion for exploring India's incredible landscapes and rich cultural heritage. Plan smarter, travel better.
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>AI-Powered Trip Planning</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="hidden md:block space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <ExternalLink className="w-5 h-5 text-orange-400" />
              <span>Quick Links</span>
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-orange-400 transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <span className="w-0 h-0.5 bg-orange-400 group-hover:w-4 transition-all duration-300" />
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Info className="w-5 h-5 text-orange-400" />
              <span>Contact</span>
            </h4>
            <ul className="space-y-3">
              {/* <li className="flex items-start space-x-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 mt-0.5 text-orange-400 flex-shrink-0" />
                <a href="mailto:contact@itinerarly.com" className="hover:text-orange-400 transition-colors duration-300">
                  contact@itinerarly.com
                </a>
              </li> */}
              <li className="flex items-start space-x-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 text-orange-400 flex-shrink-0" />
                <span>Exploring India, One Trip at a Time</span>
              </li>
            </ul>
          </div>

          {/* Feedback & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-orange-400" />
              <span>Stay Connected</span>
            </h4>
            
            {/* Feedback Button */}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSexfbSiW6zL_2WNWqZ-NtISlxNu5y02-sJPVhc9rq3pVIYboA/viewform?usp=header"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500/80 to-green-500/80 backdrop-blur-sm rounded-lg border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <MessageSquare className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300 relative z-10" />
              <span className="relative z-10">Share Feedback</span>
            </a>
            
            {/* Social Icons */}
            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-3">Follow us on social media</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 hover:-translate-y-1 backdrop-blur-sm border border-white/10 group`}
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5 group-hover:rotate-6 transition-transform duration-300" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-sm">
          <div className="flex items-center space-x-2 text-gray-400">
            <span>&copy; {currentYear} Itinerarly.</span>
            <span className="hidden sm:inline">All rights reserved.</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-gray-400">
            <div className="flex items-center space-x-2 group">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 group-hover:scale-125 transition-transform duration-300 animate-pulse" />
              <span>for travelers</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/10 to-green-500/10 border border-orange-500/20">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-medium">AI Powered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
    </footer>
  );
};

export default Footer;