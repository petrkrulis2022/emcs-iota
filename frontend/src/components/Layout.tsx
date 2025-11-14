import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import WalletConnect from './WalletConnect';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getLinkClass = (path: string) => {
    const baseClass =
      'px-3 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center';
    return isActive(path)
      ? `${baseClass} bg-blue-50 text-blue-600`
      : `${baseClass} text-gray-700 hover:text-blue-600 hover:bg-gray-50`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link to="/" className="text-lg sm:text-xl font-bold text-blue-600 whitespace-nowrap">
                EMCS Blockchain
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link to="/" className={getLinkClass('/')}>
                  Dashboard
                </Link>
                <Link to="/create" className={getLinkClass('/create')}>
                  Create Consignment
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden sm:block">
                <WalletConnect />
              </div>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 min-h-[44px] min-w-[44px]"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!mobileMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" className={getLinkClass('/')} onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link
                to="/create"
                className={getLinkClass('/create')}
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Consignment
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200 px-4 sm:hidden">
              <WalletConnect />
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
