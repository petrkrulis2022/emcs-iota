import { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';

interface IOTAIdentity {
  did: string;
  walletAddress: string;
  verifiableCredentials: {
    seedNumber: string;
    companyName: string;
    vatNumber: string;
    country: string;
    countryCode: string;
    address: string;
    city: string;
    postalCode: string;
    email: string;
    phone: string;
    contactPerson?: string;
    authorizedGoods: string[];
    licenseNumber: string;
    issuedBy: string;
    issuedAt: string;
    expiresAt: string;
  };
  domainLinkage?: {
    domain: string;
    verified: boolean;
  };
}

interface IOTAIdentityCardProps {
  walletAddress: string;
  label?: string;
  onIdentityResolved?: (identity: IOTAIdentity | null) => void;
}

export default function IOTAIdentityCard({ 
  walletAddress, 
  label = 'Identity',
  onIdentityResolved 
}: IOTAIdentityCardProps) {
  const [identity, setIdentity] = useState<IOTAIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdentity = async () => {
      if (!walletAddress || !walletAddress.startsWith('0x')) {
        setLoading(false);
        if (onIdentityResolved) onIdentityResolved(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.resolveIdentity(walletAddress);
        setIdentity(response);
        if (onIdentityResolved) onIdentityResolved(response);
      } catch (err) {
        console.error('Failed to resolve IOTA Identity:', err);
        setError('Identity not found');
        setIdentity(null);
        if (onIdentityResolved) onIdentityResolved(null);
      } finally {
        setLoading(false);
      }
    };

    fetchIdentity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]); // Only depend on walletAddress, not onIdentityResolved

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
          <span className="text-sm text-purple-700">Resolving IOTA Identity...</span>
        </div>
      </div>
    );
  }

  if (error || !identity) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-yellow-800">No IOTA Identity found for this wallet</span>
        </div>
      </div>
    );
  }

  const { verifiableCredentials: vc, domainLinkage } = identity;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-lg p-4 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-bold text-purple-900">{label} - IOTA Identity</h3>
            <p className="text-xs text-purple-600">Verified Credentials</p>
          </div>
        </div>
        {domainLinkage?.verified && (
          <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium text-green-700">Verified</span>
          </div>
        )}
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-lg p-3 mb-3">
        <h4 className="font-bold text-gray-900 text-lg mb-2">{vc.companyName}</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">SEED:</span>
            <span className="ml-2 font-mono font-medium text-purple-700">{vc.seedNumber}</span>
          </div>
          <div>
            <span className="text-gray-600">VAT:</span>
            <span className="ml-2 font-medium text-gray-900">{vc.vatNumber}</span>
          </div>
          <div>
            <span className="text-gray-600">Country:</span>
            <span className="ml-2 font-medium text-gray-900">
              {vc.countryCode} - {vc.country}
            </span>
          </div>
          <div>
            <span className="text-gray-600">License:</span>
            <span className="ml-2 font-medium text-gray-900">{vc.licenseNumber}</span>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg p-3 mb-3">
        <p className="text-sm text-gray-700">
          {vc.address}, {vc.city} {vc.postalCode}
        </p>
        <div className="mt-2 space-y-1 text-sm">
          <p className="text-gray-600">
            📧 {vc.email}
          </p>
          <p className="text-gray-600">
            📞 {vc.phone}
          </p>
          {vc.contactPerson && (
            <p className="text-gray-600">
              👤 {vc.contactPerson}
            </p>
          )}
        </div>
      </div>

      {/* Authorized Goods */}
      <div className="bg-white rounded-lg p-3 mb-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Authorized Excise Goods:</p>
        <div className="flex flex-wrap gap-1">
          {vc.authorizedGoods.map((good) => (
            <span
              key={good}
              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
            >
              {good}
            </span>
          ))}
        </div>
      </div>

      {/* DID & Issuer */}
      <div className="bg-purple-100 rounded-lg p-2 text-xs">
        <p className="text-purple-900 mb-1">
          <span className="font-semibold">DID:</span> <span className="font-mono">{identity.did}</span>
        </p>
        <p className="text-purple-800">
          <span className="font-semibold">Issued by:</span> {vc.issuedBy}
        </p>
        {domainLinkage && (
          <p className="text-purple-800 mt-1">
            <span className="font-semibold">Domain:</span> {domainLinkage.domain}
          </p>
        )}
      </div>
    </div>
  );
}
