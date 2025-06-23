import ReactDOM from "react-dom/client";
import React, { useEffect, useState } from "react";
import reportWebVitals from "./reportWebVitals";
import { PublicClientApplication } from "@azure/msal-browser";
import App from "./App";
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest, msalConfig } from "./authConfig";

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
  <MsalProvider instance={msalInstance}>
    <AuthWrapper>
      <TokenProvider>
        <App />
      </TokenProvider>
    </AuthWrapper>
  </MsalProvider>
);

reportWebVitals();
