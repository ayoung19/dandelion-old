import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { hydrate, addToast } from "../store/actions";
import { useAuth0 } from "@auth0/auth0-react";

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const AUTH0_DOMAIN = "andyluyoung.us.auth0.com";
export const AUTH0_CLIENT_ID = "Qz1PPp3LBtL4mAHll8xF91LqsOBVp5Ur";
export const AUTH0_AUDIENCE = "https://dandelion.api";

export const useAuthFetch = () => {
  const dispatch = useAppDispatch();
  const { getAccessTokenSilently } = useAuth0();

  const AuthFetch = async (method: string, endpoint: string, body?: string) => {
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}${endpoint}`,
        {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: body,
        }
      );

      const { status, data } = await response.json();

      console.log(status, data);

      if (status === "success") {
        dispatch(hydrate(data));
      }

      if (status === "error") {
        dispatch(
          addToast({
            color: "danger",
            text: data,
          })
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  return { AuthFetch };
};
