import '../styles/global.css';
import React from 'react';
import { Analytics } from '@vercel/analytics/react'
import { TokenProvider } from '@/lib/TokenProvider';
import { GoogleAnalytics } from '@next/third-parties/google'
import AuthWrapper from '@/components/AuthWrapper';
import '@/lib/axios-config';

export const metadata = {
  title: 'Itinerary App',
  description: 'Plan and organize your trips effortlessly',
};


export default function Layout({ children }: { children: React.ReactNode }) {

  const gaId = process.env.GA_ID ;

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        
        {/* Favicon */}
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        
        {/* Performance optimizations */}
        <link rel="preload" href="/assets/bg-poster.png" as="image" type="image/png" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Backend server preconnect for faster cookie handling */}
        <link rel="preconnect" href="https://itinerarly-be.onrender.com" />
        <link rel="dns-prefetch" href="https://itinerarly-be.onrender.com" />
        <link rel="dns-prefetch" href="https://ui-avatars.com" />
        
        {/* Viewport and responsive meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body>
        <TokenProvider>
          {children}
          <AuthWrapper />
        </TokenProvider>
        <Analytics />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}