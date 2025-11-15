import React from 'react';
import type { Consignment } from '../stores/useConsignmentStore';

interface ConsignmentPrintPDFProps {
  consignment: Consignment;
  showOnScreen?: boolean; // New prop to show content on screen instead of hiding it
  hideButton?: boolean; // Hide the print button (for when used in print-only context)
}

export function ConsignmentPrintPDF({ consignment, showOnScreen = false, hideButton = false }: ConsignmentPrintPDFProps) {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      Draft: 'bg-gray-100 text-gray-800 border-gray-300',
      'In Transit': 'bg-blue-100 text-blue-800 border-blue-300',
      Received: 'bg-green-100 text-green-800 border-green-300',
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.Draft;
  };

  return (
    <>
      {/* Print Button */}
      {!hideButton && (
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg print:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          <span className="font-medium">Print Consignment PDF</span>
        </button>
      )}

      {/* Printable Content */}
      <div className="bg-white p-8 text-black block">
        {/* Header */}
        <div className="border-b-4 border-blue-600 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">
                EMCS CONSIGNMENT DOCUMENT
              </h1>
              <p className="text-sm text-gray-600">
                Electronic Movement and Control System for Excise Goods
              </p>
            </div>
            <div className="text-right">
              <div
                className={`inline-block px-4 py-2 rounded-lg font-bold border-2 ${getStatusBadge(consignment.status || 'Draft')}`}
              >
                {(consignment.status || 'Draft').toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* ARC and Dates */}
        <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Administrative Reference Code (ARC)
            </p>
            <p className="text-xl font-bold text-blue-900 font-mono">{consignment.arc}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Created Date</p>
            <p className="text-sm font-medium">{formatDate(consignment.createdAt)}</p>
            {consignment.dispatchedAt && (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1 mt-2">
                  Dispatched
                </p>
                <p className="text-sm font-medium">{formatDate(consignment.dispatchedAt)}</p>
              </>
            )}
            {consignment.receivedAt && (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1 mt-2">Received</p>
                <p className="text-sm font-medium">{formatDate(consignment.receivedAt)}</p>
              </>
            )}
          </div>
        </div>

        {/* Parties Information */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Consignor */}
          <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
            <h3 className="text-lg font-bold text-blue-900 mb-3 pb-2 border-b-2 border-blue-300">
              CONSIGNOR (Sender)
            </h3>
            {consignment.consignorInfo ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Company:</span>
                  <br />
                  <span className="text-gray-900">{consignment.consignorInfo.companyName}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">SEED Number:</span>
                  <br />
                  <span className="text-gray-900">{consignment.consignorInfo.seedNumber}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">VAT Number:</span>
                  <br />
                  <span className="text-gray-900">{consignment.consignorInfo.vatNumber}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Address:</span>
                  <br />
                  <span className="text-gray-900">{consignment.consignorInfo.address}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Wallet:</span>
                  <br />
                  <span className="text-xs font-mono text-gray-600 break-all">
                    {consignment.consignor}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm font-mono break-all">{consignment.consignor}</p>
            )}
          </div>

          {/* Consignee */}
          <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
            <h3 className="text-lg font-bold text-green-900 mb-3 pb-2 border-b-2 border-green-300">
              CONSIGNEE (Receiver)
            </h3>
            {consignment.consigneeInfo ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Company:</span>
                  <br />
                  <span className="text-gray-900">{consignment.consigneeInfo.companyName}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">SEED Number:</span>
                  <br />
                  <span className="text-gray-900">{consignment.consigneeInfo.seedNumber}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">VAT Number:</span>
                  <br />
                  <span className="text-gray-900">{consignment.consigneeInfo.vatNumber}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Address:</span>
                  <br />
                  <span className="text-gray-900">{consignment.consigneeInfo.address}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Wallet:</span>
                  <br />
                  <span className="text-xs font-mono text-gray-600 break-all">
                    {consignment.consignee}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm font-mono break-all">{consignment.consignee}</p>
            )}
          </div>
        </div>

        {/* Shipment Details */}
        <div className="border-2 border-gray-300 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">SHIPMENT DETAILS</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Goods Type:</span>
              <span className="ml-2 text-gray-900">{consignment.goodsType}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Quantity:</span>
              <span className="ml-2 text-gray-900">
                {consignment.quantity} {consignment.unit}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Origin:</span>
              <span className="ml-2 text-gray-900">{consignment.origin}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Destination:</span>
              <span className="ml-2 text-gray-900">{consignment.destination}</span>
            </div>
            {consignment.transportModes && consignment.transportModes.length > 0 && (
              <div className="col-span-2">
                <span className="font-semibold text-gray-700">Transport Modes:</span>
                <span className="ml-2 text-gray-900">
                  {consignment.transportModes.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Beer Details */}
        {consignment.goodsType === 'Beer' && (
          <div className="border-2 border-amber-400 rounded-lg p-4 mb-6 bg-amber-50">
            <h3 className="text-lg font-bold text-amber-900 mb-4">BEER PRODUCT DETAILS</h3>
            <div className="grid grid-cols-3 gap-4 text-sm mb-4">
              {consignment.beerName && (
                <div>
                  <span className="font-semibold text-gray-700">Beer Name:</span>
                  <br />
                  <span className="text-lg font-bold text-amber-900">{consignment.beerName}</span>
                </div>
              )}
              {consignment.alcoholPercentage && (
                <div>
                  <span className="font-semibold text-gray-700">Alcohol by Volume (ABV):</span>
                  <br />
                  <span className="text-lg font-bold text-amber-900">
                    {consignment.alcoholPercentage.toFixed(1)}%
                  </span>
                </div>
              )}
              {consignment.exciseDutyAmount && consignment.exciseDutyAmount > 0 && (
                <div className="col-span-3 bg-green-100 border-2 border-green-500 rounded-lg p-4 mt-2">
                  <span className="font-semibold text-gray-700 block mb-1">
                    IRISH EXCISE DUTY:
                  </span>
                  <span className="text-3xl font-black text-green-700">
                    €
                    {consignment.exciseDutyAmount.toLocaleString('en-IE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-xs text-gray-600 block mt-1">
                    Calculated per Irish Revenue regulations
                  </span>
                </div>
              )}
            </div>

            {/* Beer Packaging */}
            {consignment.beerPackaging && (
              <div className="border-t-2 border-amber-300 pt-4 mt-4">
                <h4 className="font-bold text-amber-900 mb-2">Packaging Details:</h4>
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Can Size:</span>
                    <br />
                    <span className="font-bold">{consignment.beerPackaging.canSize} ml</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cans/Package:</span>
                    <br />
                    <span className="font-bold">{consignment.beerPackaging.cansPerPackage}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Packages:</span>
                    <br />
                    <span className="font-bold">{consignment.beerPackaging.numberOfPackages}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Cans:</span>
                    <br />
                    <span className="font-bold">
                      {(
                        consignment.beerPackaging.cansPerPackage *
                        consignment.beerPackaging.numberOfPackages
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customs Authorities */}
        <div className="border-2 border-indigo-300 rounded-lg p-4 mb-6 bg-indigo-50">
          <h3 className="text-lg font-bold text-indigo-900 mb-4">
            EXCISE AUTHORITIES OVERSIGHT
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Czech Customs */}
            <div className="border border-indigo-200 rounded p-3 bg-white">
              <h4 className="font-bold text-indigo-900 mb-2">🇨🇿 Czech Customs Office</h4>
              <div className="text-xs space-y-1">
                <p className="font-semibold">CZ510000 - Celní úřad Pro Hlavní Město Prahu</p>
                <p>Praha 1, Czech Republic</p>
                <p>
                  <span className="font-semibold">Phone:</span> +420 261 334 350
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{' '}
                  podatelna510000@celnisprava.cz
                </p>
                <p className="font-semibold mt-2">Office Hours:</p>
                <p>Monday: 08:00 - 17:00</p>
                <p>Tuesday: 08:00 - 15:00</p>
                <p>Wednesday: 08:00 - 17:00</p>
                <p>Thursday: 08:00 - 15:00</p>
                <p>Friday: 08:00 - 14:00</p>
              </div>
            </div>

            {/* Irish Revenue */}
            <div className="border border-indigo-200 rounded p-3 bg-white">
              <h4 className="font-bold text-indigo-900 mb-2">🇮🇪 Irish Revenue Office</h4>
              <div className="text-xs space-y-1">
                <p className="font-semibold">Revenue Commissioners - Customs Division</p>
                <p>Castle House</p>
                <p>South Great Georges' Street</p>
                <p>Dublin 2, Ireland</p>
                <p>
                  <span className="font-semibold">Phone:</span> +353 1 647 5000
                </p>
                <p>
                  <span className="font-semibold">Website:</span> www.revenue.ie
                </p>
                <p className="mt-2 text-gray-600">
                  <span className="font-semibold">Secure Enquiries:</span> Use the 'MyEnquiries'
                  service on their website
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Hash */}
        {consignment.documentHash && (
          <div className="border border-gray-300 rounded-lg p-4 mb-6 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              BLOCKCHAIN VERIFICATION (e-AD Document Hash)
            </h3>
            <p className="text-xs font-mono break-all text-gray-700">{consignment.documentHash}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-xs text-gray-600">
          <div className="flex justify-between">
            <div>
              <p>Printed: {new Date().toLocaleString('en-IE')}</p>
              <p>EMCS Blockchain System - IOTA Network</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">This is a blockchain-verified document</p>
              <p>Transaction ID: {consignment.transactionId || 'Pending'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConsignmentPrintPDF;
