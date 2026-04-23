export const msalConfig = {
  auth: {
    clientId: "cd8eb07e-2d07-4f48-8a8b-3a7ff43128d2",
    authority: "https://login.microsoftonline.com/50640584-2a40-4216-a84b-9b3ee0f3f6cf",
    redirectUri: "http://localhost:3033/",
  },
  cache: {
    cacheLocation: "localStorage",
  },

};


export const loginRequest = {
  scopes: ["User.Read"]
};


export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};
