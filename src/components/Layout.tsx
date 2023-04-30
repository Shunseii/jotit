import { useUser } from "@clerk/nextjs";
import { Dialog, Transition } from "@headlessui/react";
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  FolderIcon,
  GlobeAltIcon,
  ServerIcon,
  SignalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Fragment, useState } from "react";
import { ThemeToggleButton } from "./ThemeToggleButton";
import Image from "next/image";

const navigation = [
  { name: "Projects", href: "#", icon: FolderIcon, current: false },
  { name: "Deployments", href: "#", icon: ServerIcon, current: true },
  { name: "Activity", href: "#", icon: SignalIcon, current: false },
  { name: "Domains", href: "#", icon: GlobeAltIcon, current: false },
  { name: "Usages", href: "#", icon: ChartBarSquareIcon, current: false },
  { name: "Settings", href: "#", icon: Cog6ToothIcon, current: false },
];

const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};

const NavMenu = () => {
  const { user } = useUser();

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/5">
      <div className="flex h-16 shrink-0 items-center justify-between">
        <img
          className="h-8 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
          alt="Your Company"
        />

        <ThemeToggleButton />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map(({ current, href, icon: Icon, name }) => (
                <li key={name}>
                  <a
                    href={href}
                    className={classNames(
                      current
                        ? "bg-gray-50 text-indigo-600 dark:bg-gray-800 dark:text-white"
                        : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white",
                      "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                    )}
                  >
                    <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </li>
          <li className="-mx-6 mt-auto">
            <a
              href="#"
              className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
            >
              {user?.profileImageUrl && (
                <Image
                  className="h-8 w-8 rounded-full dark:bg-gray-800"
                  width={32}
                  height={32}
                  src={user.profileImageUrl}
                  alt=""
                />
              )}

              <span className="sr-only">Your profile</span>
              <span aria-hidden="true">{user?.username}</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return null;
  }

  return (
    <div>
      <Transition.Root show={isSidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 xl:hidden"
          onClose={setIsSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>

                {/* Sidebar component */}
                <NavMenu />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
        {/* Sidebar component */}
        <NavMenu />
      </div>

      <div className="xl:ml-72">
        {/* Sticky search header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-white/5 dark:bg-gray-900 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 dark:text-white xl:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form className="flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Search
              </label>
              <div className="relative w-full">
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-700 dark:text-gray-500"
                  aria-hidden="true"
                />
                <input
                  id="search-field"
                  className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-gray-700 focus:ring-0 dark:text-white sm:text-sm"
                  placeholder="Search..."
                  type="search"
                  name="search"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
