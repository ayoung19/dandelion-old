import React, { FC, ReactNode } from "react";
import { useHistory } from "react-router-dom";
import { AppState, Auth0Provider } from "@auth0/auth0-react";
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE } from "../utils";

interface Auth0ProviderWithHistoryProps {
  children?: ReactNode;
}

export const Auth0ProviderWithHistory: FC<Auth0ProviderWithHistoryProps> = ({
  children,
}) => {
  const history = useHistory();

  const onRedirectCallback = (appState: AppState) => {
    history.push(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      redirectUri={window.location.href}
      onRedirectCallback={onRedirectCallback}
      audience={AUTH0_AUDIENCE}
    >
      {children}
    </Auth0Provider>
  );
};
