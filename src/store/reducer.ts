import { ApplicationState, ApplicationAction } from "./types";

export const initialState: ApplicationState = {
  toasts: [],
  user: undefined,
};

const reducer = (
  state = initialState,
  action: ApplicationAction
): ApplicationState => {
  switch (action.type) {
    case "hydrate":
      return {
        ...state,
        user: action.user,
      };
    case "addToast":
      return {
        ...state,
        toasts: state.toasts.concat(action.toast),
      };
    case "removeToast":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.toast.id),
      };
    default:
      return state;
  }
};

export default reducer;
