import ReactDOM from "react-dom/client";
import React, { useEffect, useState } from "react";
import reportWebVitals from "./reportWebVitals";
import { PublicClientApplication } from "@azure/msal-browser";
import App from "./App";
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest, msalConfig } from "./authConfig";
import { AppInsightsContext } from "@microsoft/applicationinsights-react-js";
import { reactPlugin, appInsights } from "./appInsights";

function AuthWrapper({ children }) {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      }).then(response => {
        setToken(response.accessToken);
        
        // Track successful authentication
        appInsights.trackEvent({
          name: 'UserAuthenticated',
          properties: {
            userId: accounts[0].localAccountId,
            username: accounts[0].username
          }
        });
      }).catch(error => {
        // Track authentication errors
        appInsights.trackException({
          exception: error,
          properties: {
            context: 'TokenAcquisition'
          }
        });
      });
    }
    // Trigger loginRedirect if not authenticated and not already in progress
    else if (!isAuthenticated && inProgress === "none") {
      instance.loginRedirect(loginRequest);
    }
  }, [isAuthenticated, accounts, instance, inProgress]);

  if (!isAuthenticated) {
    return <div>Redirecting to Microsoft login...</div>;
  }

  return React.cloneElement(children);
}

function TokenProvider({ children }) {
  const { instance, accounts } = useMsal();

  const getToken = async () => {
    if (accounts.length > 0) {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      return response.accessToken;
    }
    return null;
  };

  return React.cloneElement(children, { getToken });
}

const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AppInsightsContext.Provider value={reactPlugin}>
    <MsalProvider instance={msalInstance}>
      <AuthWrapper>
        <TokenProvider>
          <App />
        </TokenProvider>
      </AuthWrapper>
    </MsalProvider>
  </AppInsightsContext.Provider>
);

reportWebVitals();
