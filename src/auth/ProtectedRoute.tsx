import React, { FC } from "react";
import { Route } from "react-router-dom";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { EuiLoadingSpinner } from "@elastic/eui";

interface ProtectedRouteProps {
  [x: string]: any;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  component,
  ...props
}) => (
  <Route
    component={withAuthenticationRequired(component, {
      onRedirecting: () => <EuiLoadingSpinner />,
    })}
    {...props}
  />
);
