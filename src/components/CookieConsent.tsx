'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Shield, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      try {
        // Handle legacy 'accepted' value
        if (consent === 'accepted') {
          // Clear legacy value and show banner
          localStorage.removeItem('cookieConsent');
          setTimeout(() => setShowBanner(true), 1000);
          return;
        }
        
        // Load saved preferences and initialize analytics if consented
        const savedPreferences = JSON.parse(consent);
        if (savedPreferences.analytics) {
          initializeGoogleAnalytics();
        }
      } catch (e) {
        // If parsing fails, clear invalid data and show banner
        console.error('Invalid cookie consent data:', e);
        localStorage.removeItem('cookieConsent');
        setTimeout(() => setShowBanner(true), 1000);
      }
    }
  }, []);

  const initializeGoogleAnalytics = () => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      // Initialize Google Analytics
      window.gtag('js', new Date());
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        cookie_flags: 'SameSite=None;Secure',
        anonymize_ip: true, // GDPR compliance
      });
    }
  };

  const handleAcceptAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(newPreferences);
    initializeGoogleAnalytics();
  };

  const handleAcceptSelected = () => {
    savePreferences(preferences);
    if (preferences.analytics) {
      initializeGoogleAnalytics();
    }
  };

  const handleRejectAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(newPreferences);
  };

  const savePreferences = (prefs: typeof preferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
    setShowDetails(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">We value your privacy</h3>
                <p className="text-sm text-gray-600">
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                  By clicking "Accept All", you consent to our use of cookies.{' '}
                  <button
                    onClick={() => setShowDetails(true)}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Manage preferences
                  </button>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Cookie Settings Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Cookie Preferences</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-sm text-gray-600 mb-6">
                We use cookies and similar technologies to help personalize content, tailor and measure ads, 
                and provide a better experience. You can customize your choices below.
              </p>

              {/* Cookie Categories */}
              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">Necessary Cookies</h3>
                        <p className="text-sm text-gray-600">
                          These cookies are essential for the website to function properly. They enable basic 
                          functions like page navigation and access to secure areas of the website.
                        </p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={preferences.necessary}
                        disabled
                        className="w-5 h-5 text-blue-600 rounded cursor-not-allowed opacity-60"
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Always active
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">Analytics Cookies</h3>
                        <p className="text-sm text-gray-600">
                          These cookies help us understand how visitors interact with our website by collecting 
                          and reporting information anonymously. This helps us improve our website and services.
                        </p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Google Analytics, anonymized IP addresses
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">Marketing Cookies</h3>
                        <p className="text-sm text-gray-600">
                          These cookies are used to track visitors across websites to display ads that are 
                          relevant and engaging for individual users.
                        </p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Currently not in use
                  </div>
                </div>
              </div>

              {/* Privacy Policy Link */}
              <div className="mt-6 text-sm text-gray-600">
                Learn more about how we handle your data in our{' '}
                <a 
                  href="/privacy-policy" 
                  target="_blank"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Privacy Policy
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reject All
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAcceptSelected}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}