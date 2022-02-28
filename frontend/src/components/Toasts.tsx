import { useAppDispatch, useAppSelector } from "../utils";
import { removeToast } from "../store/actions";
import { EuiGlobalToastList } from "@elastic/eui";
import { Toast } from "@elastic/eui/src/components/toast/global_toast_list";

export const Toasts = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.toasts);

  const dismissHandler = (toast: Toast) => {
    dispatch(removeToast(toast));
  };

  return (
    <EuiGlobalToastList
      toasts={toasts}
      dismissToast={dismissHandler}
      toastLifeTimeMs={6000}
    />
  );
};
