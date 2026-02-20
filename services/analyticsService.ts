type AnalyticsValue = string | number | boolean;
type AnalyticsParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const isAnalyticsReady = (): boolean =>
  typeof window !== 'undefined' && typeof window.gtag === 'function';

export const trackEvent = (eventName: string, params: AnalyticsParams = {}): void => {
  if (!isAnalyticsReady()) {
    return;
  }

  window.gtag?.('event', eventName, params);
};

