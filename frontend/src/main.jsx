import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import * as Sentry from "@sentry/react";

// Sentry + PostHog Integrated SPA
// Version: 1.3
// Developed with Antigravity
// Sentry Error Monitoring & Logging
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "https://8abca21686269d62b8a2d91a516bd7b0@o4511186323046400.ingest.us.sentry.io/4511186326192128",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Initialize PostHog for Analytics (DAU, Retention, Events)
const posthogKey = import.meta.env.VITE_POSTHOG_KEY || 'phc_dummy_key_for_nestfund_mvp_123';
posthog.init(posthogKey, {
  api_host: 'https://us.i.posthog.com',
  autocapture: true,
  capture_pageview: true, // Tracks DAU automatically
  capture_pageleave: true // Better retention metrics
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<div style={{padding: '50px', textAlign: 'center', color: '#fff'}}><h2>Something went wrong.</h2><p>Our team has been notified. Please refresh the page.</p></div>}>
      <PostHogProvider client={posthog}>
        <App />
      </PostHogProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
