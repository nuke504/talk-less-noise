import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

const reactPlugin = new ReactPlugin();

// Get connection string from environment variable or fallback
const connectionString = process.env.REACT_APP_APPINSIGHTS_CONNECTION_STRING || 
  process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

export const appInsights = new ApplicationInsights({
  config: {
    connectionString: connectionString,
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: { history: null } // We'll set this in index.js
    },
    enableAutoRouteTracking: true,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    correlationHeaderExcludedDomains: ['*.core.windows.net', '*.core.chinacloudapi.cn', '*.core.cloudapi.de', '*.core.usgovcloudapi.net'],
    disableFetchTracking: false,
    enableAjaxErrorStatusText: true,
    enableUnhandledPromiseRejectionTracking: true
  }
});

// Initialize only if connection string is available
if (connectionString) {
  appInsights.loadAppInsights();
  appInsights.trackPageView(); // Initial page view
} else {
  console.warn('Application Insights connection string not found. Telemetry will not be collected.');
}

export { reactPlugin };