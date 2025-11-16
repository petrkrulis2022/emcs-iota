import { useNavigate } from 'react-router-dom';
import type { Consignment } from '../stores/useConsignmentStore';
import { ConsignmentPrintPDF } from './ConsignmentPrintPDF';
import { useState } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  arc: string;
  transactionId: string;
  onClose: () => void;
  onCreateAnother: () => void;
  consignment?: Consignment;
}

export default function SuccessModal({
  isOpen,
  arc,
  transactionId,
  onClose,
  onCreateAnother,
  consignment,
}: SuccessModalProps) {
  const navigate = useNavigate();
  const [showPDFModal, setShowPDFModal] = useState(false);

  if (!isOpen) return null;

  const handleViewConsignment = () => {
    if (consignment) {
      setShowPDFModal(true);
    } else {
      onClose();
      navigate(`/dashboard/consignment/${arc}`);
    }
  };

  const handlePrintPDF = () => {
    if (!consignment) {
      // If no consignment data, navigate to the detail page where print is available
      navigate(`/dashboard/consignment/${arc}`);
    } else {
      // Show PDF in modal
      setShowPDFModal(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateAnother = () => {
    onClose();
    onCreateAnother();
  };

  // IOTA Explorer URL (using testnet)
  const explorerUrl = `https://explorer.iota.org/txblock/${transactionId}?network=testnet`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Consignment Created!
          </h2>

          <p className="text-center text-gray-600 mb-6">
            Your consignment has been successfully created on the blockchain.
          </p>

          {/* ARC Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Administrative Reference Code (ARC)
            </p>
            <p className="text-2xl font-mono font-bold text-blue-600 break-all">{arc}</p>
          </div>

          {/* Transaction ID */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-1">Transaction ID</p>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
            >
              {transactionId}
            </a>
            <p className="text-xs text-gray-500 mt-1">Click to view on IOTA Explorer</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePrintPDF}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              <span>Print PDF</span>
            </button>
            <button
              onClick={handleViewConsignment}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              View Details
            </button>
          </div>
          
          <div className="mt-3">
            <button
              onClick={handleCreateAnother}
              className="w-full bg-white text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Create Another
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* PDF Modal */}
      {showPDFModal && consignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto print:relative print:z-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 print:hidden" onClick={() => setShowPDFModal(false)}></div>
          
          <div className="flex min-h-full items-center justify-center p-4 print:p-0">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 print:shadow-none print:max-w-none">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4 print:hidden">
                <h3 className="text-xl font-bold text-gray-900">Consignment Details</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrint}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    <span>Print PDF</span>
                  </button>
                  <button
                    onClick={() => setShowPDFModal(false)}
                    className="text-gray-400 hover:text-gray-600"
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
              </div>

              {/* PDF Content */}
              <ConsignmentPrintPDF consignment={consignment} showOnScreen={true} hideButton={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
