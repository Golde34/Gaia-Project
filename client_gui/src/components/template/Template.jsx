import { useState } from 'react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';

const Template = (props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label={isSidebarOpen ? 'Ẩn thanh điều hướng' : 'Hiển thị thanh điều hướng'}
      >
        {isSidebarOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
      </button>
      <div className="fixed top-0 left-0 h-full z-10">
        <Sidebar isOpen={isSidebarOpen} />
      </div>
      <div className={`flex flex-col flex-1 relative transition-all duration-300 ${isSidebarOpen ? 'ml-0 sm:ml-16' : 'ml-0'}`}>
        <Navbar />
        {props.children}
      </div>
    </>
  )
}
export default Template;
