'use client';

import Script from 'next/script';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            
            // Check if user has consented to analytics cookies
            try {
              const consent = localStorage.getItem('cookieConsent');
              if (consent && consent !== 'accepted') {
                const preferences = JSON.parse(consent);
                if (preferences && preferences.analytics === true) {
                  gtag('js', new Date());
                  gtag('config', '${measurementId}', {
                    cookie_flags: 'SameSite=None;Secure',
                    anonymize_ip: true
                  });
                }
              }
            } catch (e) {
              console.error('Error checking cookie consent:', e);
            }
          `,
        }}
      />
    </>
  );
}