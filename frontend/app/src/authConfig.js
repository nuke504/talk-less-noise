export const msalConfig = {
  auth: {
    clientId: "fe173945-a718-4008-911b-3aa4989606b0", // Replace with your Application (client) ID
    authority: "https://login.microsoftonline.com/a1e5e177-4d64-4406-aba0-386fefa921aa", // Or your tenant-specific endpoint
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage", // or "localStorage"
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "api://talk-less-noise-backend/access"], // Add API scopes if needed
};