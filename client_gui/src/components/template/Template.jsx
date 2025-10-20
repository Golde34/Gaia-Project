import { useMemo, useState } from 'react';
import { MenuAlt2Icon } from '@heroicons/react/outline';
import { ChevronDoubleLeftIcon } from '@heroicons/react/solid';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';

const Template = (props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sidebarClasses = useMemo(
    () =>
      `fixed top-0 left-0 h-full z-10 transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`,
    [isSidebarOpen]
  );

  const contentClasses = useMemo(
    () =>
      `flex flex-col flex-1 relative transition-all duration-300 ${
        isSidebarOpen ? 'ml-16 sm:ml-24' : 'ml-4'
      }`,
    [isSidebarOpen]
  );

  const toggleButtonClasses = useMemo(
    () =>
      `fixed top-4 z-20 flex items-center justify-center rounded-full bg-gray-800 text-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        isSidebarOpen ? 'left-20 sm:left-24' : 'left-4'
      }`,
    [isSidebarOpen]
  );

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <>
      <button
        type="button"
        aria-label={isSidebarOpen ? 'Hide navigation' : 'Show navigation'}
        className={toggleButtonClasses}
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <ChevronDoubleLeftIcon className="h-5 w-5" />
        ) : (
          <MenuAlt2Icon className="h-5 w-5" />
        )}
      </button>
      <div className={sidebarClasses}>
        <Sidebar />
      </div>
      <div className={contentClasses}>
        <Navbar />
        {props.children}
      </div>
    </>
  );
};

export default Template;
