import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useWalletStore } from '../stores/useWalletStore';
import EMCSLogo from './EMCSLogo';
import WalletButton from './WalletButton';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { walletAddress, disconnect } = useWalletStore();

  const handleLogout = () => {
    disconnect();
    navigate('/login');
  };

  const truncateAddress = (address: string): string => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getLinkClass = (path: string) => {
    const baseClass =
      'px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] flex items-center';
    return isActive(path)
      ? `${baseClass} bg-white text-blue-600 shadow-md`
      : `${baseClass} text-blue-100 hover:text-white hover:bg-blue-800`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-bold text-white">EMCS</span>
                  <p className="text-xs text-blue-200 -mt-1">Blockchain</p>
                </div>
              </Link>
              <div className="hidden md:flex space-x-2">
                <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/dashboard/all-consignments" className={getLinkClass('/dashboard/all-consignments')}>
                  My Consignments
                </Link>
                <Link to="/dashboard/create" className={getLinkClass('/dashboard/create')}>
                  Create Consignment
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* IOTA Wallet Connection */}
              <WalletButton />
              
              {/* Wallet Address Display */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-mono text-white">
                    {walletAddress ? truncateAddress(walletAddress) : ''}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white min-h-[44px] min-w-[44px]"
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
          <div className="md:hidden border-t border-white/20 bg-blue-900/50 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/dashboard" className={getLinkClass('/dashboard')} onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link
                to="/dashboard/all-consignments"
                className={getLinkClass('/dashboard/all-consignments')}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Consignments
              </Link>
              <Link
                to="/dashboard/create"
                className={getLinkClass('/dashboard/create')}
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Consignment
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-white/20 px-4 sm:hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg flex-1 mr-2 border border-white/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-mono text-white truncate">
                    {walletAddress ? truncateAddress(walletAddress) : ''}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors min-h-[44px]"
                >
                  Logout
                </button>
              </div>
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
