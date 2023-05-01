import { Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { type ReactNode, type FC } from "react";
import {
  type Toast,
  ToastIcon,
  Toaster,
  resolveValue,
  toast as rootToast,
} from "react-hot-toast";

export const NotificationListItem: FC<{
  toast: Toast;
  children: ReactNode;
  handleMouseEnter?: () => void;
  handleMouseLeave?: () => void;
}> = ({ toast, children, handleMouseEnter, handleMouseLeave }) => {
  const { visible, ariaProps, id } = toast;

  return (
    <Transition
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      appear
      show={visible}
      className="flex w-full max-w-xs"
      enter="transition-all duration-150"
      enterFrom="opacity-0 scale-50"
      enterTo="opacity-100 scale-100"
      leave="transition-all duration-150"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-75"
    >
      <div
        className="pointer-events-auto w-full overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-white/20"
        {...ariaProps}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ToastIcon toast={toast} />
            </div>

            {children}

            <div className="ml-4 flex flex-shrink-0 outline-none ring-0">
              <button
                type="button"
                className="inline-flex rounded-md border-none text-gray-400 outline-none hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-500 dark:hover:text-gray-400 dark:focus:ring-transparent"
                onClick={() => {
                  rootToast.dismiss(id);
                }}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};

export const CustomToaster = () => {
  return (
    <Toaster position="top-right">
      {(t) => (
        <NotificationListItem toast={t}>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="line-clamp-3 text-sm font-medium text-gray-900 dark:text-gray-50">
              {resolveValue(t.message, t)}
            </p>
          </div>
        </NotificationListItem>
      )}
    </Toaster>
  );
};
