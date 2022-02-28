import React, { FC } from "react";
import { Switch } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { useAuth0 } from "@auth0/auth0-react";

import { Wishes } from "./pages/Wishes";
import { FullPageSpinner } from "./components/FullPageSpinner";

export const App: FC = () => {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <Switch>
      <ProtectedRoute path="/" component={Wishes} />
    </Switch>
  );
};

export default App;
