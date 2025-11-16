import React, { useState, useEffect } from 'react';
import { useOfficerVerification } from '../hooks/useOfficerVerification';

interface FieldComparison {
  field: string;
  label: string;
  databaseValue: any;
  blockchainValue: any;
  matches: boolean;
}

interface OfficerVerificationPanelProps {
  initialArc?: string;
}

const OfficerVerificationPanel: React.FC<OfficerVerificationPanelProps> = ({ initialArc = '' }) => {
  const [arc, setArc] = useState(initialArc);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const { 
    verifyConsignment, 
    isVerifying, 
    verificationResult, 
    isOfficerConnected,
    officerAddress 
  } = useOfficerVerification();

  // Update ARC if initialArc prop changes
  useEffect(() => {
    if (initialArc) {
      setArc(initialArc);
    }
  }, [initialArc]);

  // Auto-redirect countdown after successful verification
  useEffect(() => {
    if (verificationResult?.success && redirectCountdown === null) {
      setRedirectCountdown(5);
    }
  }, [verificationResult, redirectCountdown]);

  // Countdown timer
  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0) {
      // Redirect back to customs dashboard
      window.close();
      // Fallback if window.close() doesn't work (not opened by window.open)
      setTimeout(() => {
        window.location.href = '/customs-dashboard';
      }, 100);
    }
  }, [redirectCountdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arc.trim()) {
      alert('Please enter an ARC');
      return;
    }
    await verifyConsignment(arc.trim());
  };

  const getFieldComparisons = (): FieldComparison[] => {
    if (!verificationResult?.databaseData || !verificationResult?.blockchainData) {
      return [];
    }

    const { databaseData, blockchainData, matches } = verificationResult;

    return [
      {
        field: 'arc',
        label: 'ARC Number',
        databaseValue: databaseData.arc,
        blockchainValue: blockchainData.arc,
        matches: matches?.arc ?? false,
      },
      {
        field: 'consignor',
        label: 'Consignor',
        databaseValue: databaseData.consignor,
        blockchainValue: blockchainData.consignor,
        matches: matches?.consignor ?? false,
      },
      {
        field: 'consignee',
        label: 'Consignee',
        databaseValue: databaseData.consignee,
        blockchainValue: blockchainData.consignee,
        matches: matches?.consignee ?? false,
      },
      {
        field: 'goodsType',
        label: 'Goods Type',
        databaseValue: databaseData.goodsType,
        blockchainValue: blockchainData.goods_type,
        matches: matches?.goodsType ?? false,
      },
      {
        field: 'quantity',
        label: 'Quantity',
        databaseValue: `${databaseData.quantity} ${databaseData.unit}`,
        blockchainValue: `${blockchainData.quantity} ${blockchainData.unit}`,
        matches: matches?.quantity ?? false,
      },
    ];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Revenue Officer Verification</h2>
          <p className="text-sm text-gray-600">
            Blockchain-based consignment verification with audit trail
          </p>
        </div>
      </div>

      {/* Officer Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Officer Wallet Status</p>
            {isOfficerConnected ? (
              <p className="text-xs text-green-600 font-mono mt-1">
                ✅ Connected: {officerAddress?.slice(0, 10)}...{officerAddress?.slice(-8)}
              </p>
            ) : (
              <p className="text-xs text-red-600 mt-1">
                ❌ Not connected - please connect wallet to verify
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isOfficerConnected && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Authorized Officer
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Verification Form */}
      <form onSubmit={handleVerify} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={arc}
            onChange={(e) => setArc(e.target.value)}
            placeholder="Enter ARC (e.g., ARC20240123456789)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isVerifying || !isOfficerConnected}
          />
          <button
            type="submit"
            disabled={isVerifying || !isOfficerConnected || !arc.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isVerifying ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify on Blockchain'
            )}
          </button>
        </div>
        {!isOfficerConnected && (
          <p className="text-xs text-amber-600 mt-2">
            ⚠️ Connect your officer wallet to perform blockchain verification
          </p>
        )}
      </form>

      {/* Verification Result */}
      {verificationResult && (
        <div className="space-y-4">
          {/* Redirect Countdown Banner */}
          {verificationResult.success && redirectCountdown !== null && (
            <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-blue-900">Verification Complete!</p>
                    <p className="text-sm text-blue-700">
                      Redirecting to Customs Dashboard in <span className="font-bold text-blue-900">{redirectCountdown}</span> seconds...
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    window.close();
                    setTimeout(() => window.location.href = '/customs-dashboard', 100);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Return Now
                </button>
              </div>
            </div>
          )}

          {/* Transaction Info */}
          {verificationResult.success && verificationResult.transactionDigest && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium text-green-800 mb-1">Verification Transaction Recorded</p>
                  <p className="text-sm text-green-700 font-mono break-all">
                    {verificationResult.transactionDigest}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    ✓ On-chain verification proof created with transaction fee
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* NFT Display Section */}
          {verificationResult.success && verificationResult.blockchainData && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Consignment NFT - IOTA Blockchain
                </h3>
                <p className="text-xs text-purple-100 mt-1">
                  Digital twin stored immutably on-chain
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                {/* NFT Visual Representation */}
                <div className="bg-white rounded-lg border-2 border-purple-300 p-6">
                  <div className="flex items-start gap-4">
                    {/* NFT Icon/Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-xs text-center text-purple-600 font-bold mt-2">NFT</p>
                    </div>
                    
                    {/* NFT Metadata */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">NFT Token</p>
                        <p className="text-sm font-bold text-purple-900">
                          {verificationResult.databaseData?.goodsType || 'Unknown'} Consignment #{verificationResult.databaseData?.arc}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500 font-medium">Quantity</p>
                          <p className="font-semibold text-gray-900">
                            {verificationResult.blockchainData.quantity} {verificationResult.blockchainData.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Status</p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {verificationResult.blockchainData.status || 'In Transit'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-purple-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">Route</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                            {verificationResult.blockchainData.origin || 'Origin'}
                          </span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded font-medium">
                            {verificationResult.blockchainData.destination || 'Destination'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Blockchain Proof */}
                <div className="bg-purple-100 rounded-lg p-4">
                  <p className="text-xs font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Cryptographic Proof
                  </p>
                  <p className="text-xs text-purple-800 font-mono break-all bg-white px-3 py-2 rounded border border-purple-300">
                    {verificationResult.databaseData?.transactionId || 'Transaction ID not available'}
                  </p>
                  <p className="text-xs text-purple-700 mt-2">
                    ✓ This NFT is permanently recorded on IOTA blockchain and cannot be altered or deleted
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {!verificationResult.success && verificationResult.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-red-800">Verification Failed</p>
                  <p className="text-sm text-red-700 mt-1">{verificationResult.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Field-by-Field Comparison */}
          {verificationResult.success && verificationResult.databaseData && verificationResult.blockchainData && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Data Comparison: PDF/Database vs Blockchain NFT</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Field-by-field verification to ensure document authenticity
                </p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {getFieldComparisons().map((comparison) => (
                  <div 
                    key={comparison.field}
                    className={`p-4 ${comparison.matches ? 'bg-white' : 'bg-red-50'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-gray-700">{comparison.label}</span>
                      {comparison.matches ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          ✓ Match
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          ✗ Mismatch
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">PDF/Database</p>
                        <p className={`font-mono ${comparison.matches ? 'text-gray-700' : 'text-red-600 font-semibold'}`}>
                          {comparison.databaseValue || '(empty)'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Blockchain NFT</p>
                        <p className={`font-mono ${comparison.matches ? 'text-gray-700' : 'text-red-600 font-semibold'}`}>
                          {comparison.blockchainValue || '(empty)'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overall Verification Status */}
          {verificationResult.success && verificationResult.matches && (
            <div className={`p-4 rounded-lg border ${
              Object.values(verificationResult.matches).every(m => m)
                ? 'bg-green-50 border-green-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                {Object.values(verificationResult.matches).every(m => m) ? (
                  <>
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-green-800">✓ All Fields Verified</p>
                      <p className="text-sm text-green-700">
                        PDF/Database data matches blockchain NFT - consignment is authentic
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-amber-800">⚠️ Data Mismatch Detected</p>
                      <p className="text-sm text-amber-700">
                        Some fields don't match - possible fraud or data tampering
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      {!verificationResult && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How Blockchain Verification Works</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Officer connects wallet and enters ARC number</li>
            <li>• System creates verification transaction (costs small fee)</li>
            <li>• Transaction is recorded on IOTA blockchain as audit proof</li>
            <li>• NFT metadata is fetched from blockchain</li>
            <li>• System compares PDF/database data with on-chain NFT</li>
            <li>• Visual comparison shows any discrepancies instantly</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default OfficerVerificationPanel;
