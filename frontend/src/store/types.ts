import { Action } from "redux";
import { Toast } from "@elastic/eui/src/components/toast/global_toast_list";

interface Wish {
  id: string;
  url: string;
}

export interface User {
  _id: string;
  wishes: Wish[];
  following: string[];
}

export interface ApplicationState {
  toasts: Toast[];
  user?: User;
}

export interface Hydrate extends Action {
  type: "hydrate";
  user: User;
}

export interface AddToast extends Action {
  type: "addToast";
  toast: Toast;
}

export interface RemoveToast extends Action {
  type: "removeToast";
  toast: Toast;
}

export type ApplicationAction = Hydrate | AddToast | RemoveToast;
