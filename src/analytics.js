// PostHog analytics wrapper. Disabled (no-op) unless VITE_POSTHOG_KEY is
// set at build time. Keys come from .env (VITE_POSTHOG_KEY,
// VITE_POSTHOG_HOST). The host defaults to the US cloud — set to
// `https://eu.i.posthog.com` for the EU region.
import posthog from 'posthog-js';
import { GAME_VERSION } from './constants.js';

let enabled = false;

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
  if (!key) return;
  posthog.init(key, {
    api_host: host,
    // Lean profile for a static game: skip page-leave / heatmap / session
    // recording. We send custom events explicitly.
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: false,
    disable_session_recording: true,
    persistence: 'localStorage',
  });
  // Super-properties — attached to every event automatically. `environment`
  // lets PostHog filter dev traffic out of prod dashboards; `version`
  // lets us correlate event spikes with releases.
  posthog.register({
    environment: import.meta.env.PROD ? 'production' : 'development',
    version: GAME_VERSION,
  });
  enabled = true;
}

export function track(event, props = {}) {
  if (!enabled) return;
  try {
    posthog.capture(event, props);
  } catch {
    // Never let analytics errors break the game.
  }
}
