import { User, Hydrate, AddToast, RemoveToast } from "./types";
import { v4 } from "uuid";
import { Toast } from "@elastic/eui/src/components/toast/global_toast_list";

export const hydrate = (user: User): Hydrate => ({
  type: "hydrate",
  user: user,
});

export const addToast = (toast: Omit<Toast, "id">): AddToast => ({
  type: "addToast",
  toast: {
    ...toast,
    id: v4(),
  },
});

export const removeToast = (toast: Toast): RemoveToast => ({
  type: "removeToast",
  toast: toast,
});
