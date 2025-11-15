import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { showErrorNotification, showSuccessNotification } from '../utils/notifications';

const CUSTOMS_AUTHORITY_WALLET = '0xe35e7ff7ac48fe0fd80a0767bffdc18a3ecb5185debdefca9cf3e74377a00af3';

export default function CustomsLogin() {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ wallet?: string; password?: string }>({});

  const validateWalletAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{64}$/.test(address);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate wallet address
    if (!walletAddress) {
      setErrors({ wallet: 'Wallet address is required' });
      return;
    }
    
    if (!validateWalletAddress(walletAddress)) {
      setErrors({ wallet: 'Invalid IOTA wallet address format (must be 0x followed by 64 hex characters)' });
      return;
    }
    
    // Check if it's the customs authority wallet
    if (walletAddress.toLowerCase() !== CUSTOMS_AUTHORITY_WALLET.toLowerCase()) {
      setErrors({ wallet: 'Invalid customs authority credentials' });
      return;
    }
    
    // Validate password
    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }
    
    if (password.length < 4) {
      setErrors({ password: 'Password must be at least 4 characters' });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      // Store customs authority wallet
      localStorage.setItem('customsWallet', walletAddress);
      localStorage.setItem('isCustomsAuthority', 'true');
      
      showSuccessNotification('Customs Authority login successful!');
      
      // Navigate to customs dashboard
      navigate('/customs-dashboard');
      
      setIsLoading(false);
    }, 1000);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 flex items-center justify-center p-4">
      {/* Back Button - Top Left */}
      <div className="absolute top-6 left-6">
        <button
          onClick={handleBackToLogin}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to Operator Login</span>
        </button>
      </div>

      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <svg
              className="w-12 h-12 text-emerald-600"
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
          <h1 className="text-4xl font-bold text-white mb-2">🇮🇪 Irish Revenue</h1>
          <p className="text-emerald-200 text-lg">Customs Authority Portal</p>
          <p className="text-emerald-300 text-sm mt-2">EMCS Monitoring & Oversight</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Customs Officer Login
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Wallet Address Input */}
            <div>
              <label htmlFor="wallet" className="block text-sm font-medium text-gray-700 mb-2">
                Authority Wallet Address
              </label>
              <input
                type="text"
                id="wallet"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm ${
                  errors.wallet ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0x..."
              />
              {errors.wallet && (
                <p className="mt-2 text-sm text-red-600">{errors.wallet}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Access Customs Portal</span>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm font-semibold text-emerald-900 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-emerald-800">
              <p className="font-mono break-all">
                <strong>Wallet:</strong> 0xe35e7ff7ac48fe0fd80a0767bffdc18a3ecb5185debdefca9cf3e74377a00af3
              </p>
              <p>
                <strong>Password:</strong> Any password works
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-emerald-200 text-sm">
          <p>Irish Revenue Commissioners</p>
          <p className="mt-1">Castle House, Dublin 2, Ireland</p>
        </div>
      </div>
    </div>
  );
}
