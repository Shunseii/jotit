import { Transition } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { Fragment, type ReactNode, type Ref } from "react";
import { useToaster } from "react-hot-toast/headless";

export const CustomToaster = () => {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause, calculateOffset, updateHeight } = handlers;

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6"
        onMouseEnter={startPause}
        onMouseLeave={endPause}
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {toasts.map((toast) => {
            const offset = calculateOffset(toast, {
              reverseOrder: false,
              gutter: 8,
            });

            const ref: Ref<HTMLElement> = (el) => {
              if (el && typeof toast.height !== "number") {
                const height = el.getBoundingClientRect().height;
                updateHeight(toast.id, height);
              }
            };

            return (
              <Transition
                key={toast.id}
                show={toast.visible}
                as={Fragment}
                enter="transform ease-out duration-300 transition"
                enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="p-4">
                    <div className="flex items-start">
                      {toast.type === "error" && (
                        <div className="flex-shrink-0">
                          <CheckCircleIcon
                            className="h-6 w-6 text-green-400"
                            aria-hidden="true"
                          />
                        </div>
                      )}

                      <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900">
                          {toast.message as ReactNode}
                        </p>
                        {/* <p className="mt-1 text-sm text-gray-500">Anyone with a link can now view this file.</p> */}
                      </div>
                      {/* <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => {
                        setShow(false)
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div> */}
                    </div>
                  </div>
                </div>
              </Transition>
              // <div
              //   key={toast.id}
              //   ref={ref}
              //   style={{
              //     position: 'absolute',
              //     width: '200px',
              //     background: 'papayawhip',
              //     transition: 'all 0.5s ease-out',
              //     opacity: toast.visible ? 1 : 0,
              //     transform: `translateY(${offset}px)`,
              //   }}
              //   {...toast.ariaProps}
              // >
              //   {toast.message as ReactNode}
              // </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
