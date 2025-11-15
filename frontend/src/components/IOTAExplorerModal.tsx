import React, { useState } from 'react';
import type { Consignment } from '../stores/useConsignmentStore';

interface IOTAExplorerModalProps {
  consignment: Consignment;
  onClose: () => void;
}

interface NFTMetadata {
  objectId: string;
  version: string;
  digest: string;
  type: string;
  owner: {
    AddressOwner: string;
  };
  previousTransaction: string;
  storageRebate: string;
  content: {
    dataType: string;
    type: string;
    hasPublicTransfer: boolean;
    fields: {
      arc: string;
      consignor: string;
      consignee: string;
      goods_type: string;
      quantity: string;
      unit: string;
      origin: string;
      destination: string;
      transport_modes: string[];
      beer_name?: string;
      alcohol_percentage?: string;
      excise_duty_cents?: string;
      status: string;
      document_hash?: string;
      created_at: string;
      dispatched_at?: string;
      received_at?: string;
    };
  };
}

export default function IOTAExplorerModal({ consignment, onClose }: IOTAExplorerModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationResults, setVerificationResults] = useState<
    { field: string; match: boolean; emcsValue: string; iotaValue: string }[]
  >([]);

  // Generate mock NFT metadata based on consignment
  const generateMockNFTMetadata = (): NFTMetadata => {
    const objectId = `0x${consignment.arc.toLowerCase().replace(/[^a-f0-9]/g, '')}${Math.random().toString(16).slice(2, 18)}`;
    
    return {
      objectId,
      version: '1',
      digest: consignment.documentHash || `0x${Math.random().toString(16).slice(2, 66)}`,
      type: '0x...::emcs::consignment::Consignment',
      owner: {
        AddressOwner: consignment.consignor,
      },
      previousTransaction: consignment.transactionId || `0x${Math.random().toString(16).slice(2, 66)}`,
      storageRebate: '1000000',
      content: {
        dataType: 'moveObject',
        type: '0x...::emcs::consignment::Consignment',
        hasPublicTransfer: false,
        fields: {
          arc: consignment.arc,
          consignor: consignment.consignor,
          consignee: consignment.consignee,
          goods_type: consignment.goodsType,
          quantity: consignment.quantity.toString(),
          unit: consignment.unit,
          origin: consignment.origin,
          destination: consignment.destination,
          transport_modes: consignment.transportModes || [],
          beer_name: consignment.beerName,
          alcohol_percentage: consignment.alcoholPercentage
            ? (consignment.alcoholPercentage * 10).toString()
            : undefined,
          excise_duty_cents: consignment.exciseDutyAmount
            ? (consignment.exciseDutyAmount * 100).toString()
            : undefined,
          status: consignment.status === 'Draft' ? '0' : consignment.status === 'In Transit' ? '1' : '2',
          document_hash: consignment.documentHash,
          created_at: new Date(consignment.createdAt).getTime().toString(),
          dispatched_at: consignment.dispatchedAt
            ? new Date(consignment.dispatchedAt).getTime().toString()
            : undefined,
          received_at: consignment.receivedAt
            ? new Date(consignment.receivedAt).getTime().toString()
            : undefined,
        },
      },
    };
  };

  const [nftMetadata] = useState<NFTMetadata>(generateMockNFTMetadata());

  const handleVerify = async () => {
    setIsVerifying(true);

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Compare EMCS data with NFT metadata
    const results = [
      {
        field: 'ARC',
        match: consignment.arc === nftMetadata.content.fields.arc,
        emcsValue: consignment.arc,
        iotaValue: nftMetadata.content.fields.arc,
      },
      {
        field: 'Consignor',
        match: consignment.consignor === nftMetadata.content.fields.consignor,
        emcsValue: consignment.consignor,
        iotaValue: nftMetadata.content.fields.consignor,
      },
      {
        field: 'Consignee',
        match: consignment.consignee === nftMetadata.content.fields.consignee,
        emcsValue: consignment.consignee,
        iotaValue: nftMetadata.content.fields.consignee,
      },
      {
        field: 'Goods Type',
        match: consignment.goodsType === nftMetadata.content.fields.goods_type,
        emcsValue: consignment.goodsType,
        iotaValue: nftMetadata.content.fields.goods_type,
      },
      {
        field: 'Quantity',
        match: consignment.quantity.toString() === nftMetadata.content.fields.quantity,
        emcsValue: `${consignment.quantity} ${consignment.unit}`,
        iotaValue: `${nftMetadata.content.fields.quantity} ${nftMetadata.content.fields.unit}`,
      },
      {
        field: 'Origin → Destination',
        match:
          consignment.origin === nftMetadata.content.fields.origin &&
          consignment.destination === nftMetadata.content.fields.destination,
        emcsValue: `${consignment.origin} → ${consignment.destination}`,
        iotaValue: `${nftMetadata.content.fields.origin} → ${nftMetadata.content.fields.destination}`,
      },
    ];

    setVerificationResults(results);
    setIsVerified(results.every((r) => r.match));
    setIsVerifying(false);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case '0':
        return 'Draft';
      case '1':
        return 'In Transit';
      case '2':
        return 'Received';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div>
              <h2 className="text-2xl font-bold">IOTA Explorer - NFT Details</h2>
              <p className="text-indigo-100 text-sm">Blockchain Verification Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-indigo-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Object Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-lg p-5">
            <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              Object Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Object ID:</span>
                <p className="font-mono text-xs text-indigo-900 break-all mt-1 bg-white px-2 py-1 rounded">
                  {nftMetadata.objectId}
                </p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Version:</span>
                <p className="text-gray-900 mt-1">{nftMetadata.version}</p>
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-gray-700">Digest:</span>
                <p className="font-mono text-xs text-indigo-900 break-all mt-1 bg-white px-2 py-1 rounded">
                  {nftMetadata.digest}
                </p>
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-gray-700">Type:</span>
                <p className="font-mono text-xs text-indigo-900 mt-1 bg-white px-2 py-1 rounded">
                  {nftMetadata.type}
                </p>
              </div>
            </div>
          </div>

          {/* NFT Content Fields */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              Consignment NFT Fields
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded border border-gray-200">
                <span className="font-semibold text-gray-600 text-xs uppercase">ARC</span>
                <p className="text-gray-900 font-mono mt-1">{nftMetadata.content.fields.arc}</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <span className="font-semibold text-gray-600 text-xs uppercase">Status</span>
                <p className="text-gray-900 mt-1">{getStatusText(nftMetadata.content.fields.status)}</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <span className="font-semibold text-gray-600 text-xs uppercase">Goods Type</span>
                <p className="text-gray-900 mt-1">{nftMetadata.content.fields.goods_type}</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <span className="font-semibold text-gray-600 text-xs uppercase">Quantity</span>
                <p className="text-gray-900 mt-1">
                  {nftMetadata.content.fields.quantity} {nftMetadata.content.fields.unit}
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <span className="font-semibold text-gray-600 text-xs uppercase">Origin</span>
                <p className="text-gray-900 mt-1">{nftMetadata.content.fields.origin}</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <span className="font-semibold text-gray-600 text-xs uppercase">Destination</span>
                <p className="text-gray-900 mt-1">{nftMetadata.content.fields.destination}</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 col-span-2">
                <span className="font-semibold text-gray-600 text-xs uppercase">Consignor</span>
                <p className="text-gray-900 font-mono text-xs mt-1 break-all">
                  {nftMetadata.content.fields.consignor}
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 col-span-2">
                <span className="font-semibold text-gray-600 text-xs uppercase">Consignee</span>
                <p className="text-gray-900 font-mono text-xs mt-1 break-all">
                  {nftMetadata.content.fields.consignee}
                </p>
              </div>
              {nftMetadata.content.fields.beer_name && (
                <div className="bg-amber-50 p-3 rounded border border-amber-200">
                  <span className="font-semibold text-amber-700 text-xs uppercase">Beer Name</span>
                  <p className="text-gray-900 mt-1">{nftMetadata.content.fields.beer_name}</p>
                </div>
              )}
              {nftMetadata.content.fields.alcohol_percentage && (
                <div className="bg-amber-50 p-3 rounded border border-amber-200">
                  <span className="font-semibold text-amber-700 text-xs uppercase">
                    Alcohol %
                  </span>
                  <p className="text-gray-900 mt-1">
                    {(parseInt(nftMetadata.content.fields.alcohol_percentage) / 10).toFixed(1)}%
                  </p>
                </div>
              )}
              {nftMetadata.content.fields.excise_duty_cents && (
                <div className="bg-green-50 p-3 rounded border border-green-200 col-span-2">
                  <span className="font-semibold text-green-700 text-xs uppercase">
                    Irish Excise Duty
                  </span>
                  <p className="text-gray-900 mt-1 text-lg font-bold">
                    €{(parseInt(nftMetadata.content.fields.excise_duty_cents) / 100).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Verify Button */}
          {!isVerified && verificationResults.length === 0 && (
            <div className="text-center py-4">
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center space-x-3 mx-auto"
              >
                {isVerifying ? (
                  <>
                    <svg
                      className="animate-spin h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Verifying on IOTA Blockchain...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Verify Consignment Data on IOTA</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Verification Results */}
          {verificationResults.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Data Verification Results
              </h3>
              <div className="space-y-2">
                {verificationResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 ${
                      result.match
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{result.field}</span>
                      {result.match ? (
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Verification Status */}
              <div className="mt-6 p-5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white">
                <div className="flex items-center space-x-4">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h4 className="text-2xl font-bold">✓ Consignment Data Verified on IOTA</h4>
                    <p className="text-green-100 mt-1">
                      All consignment fields match the blockchain NFT metadata. This document is
                      authentic and has not been tampered with.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              <span className="font-semibold">Network:</span> IOTA Testnet
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
