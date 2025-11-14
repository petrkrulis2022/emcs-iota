import { useNavigate } from 'react-router-dom';

interface SuccessModalProps {
  isOpen: boolean;
  arc: string;
  transactionId: string;
  onClose: () => void;
  onCreateAnother: () => void;
}

export default function SuccessModal({
  isOpen,
  arc,
  transactionId,
  onClose,
  onCreateAnother,
}: SuccessModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleViewConsignment = () => {
    onClose();
    navigate(`/consignment/${arc}`);
  };

  const handleCreateAnother = () => {
    onClose();
    onCreateAnother();
  };

  // IOTA Explorer URL (using testnet)
  const explorerUrl = `https://explorer.iota.org/testnet/transaction/${transactionId}`;

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
              onClick={handleViewConsignment}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              View Consignment
            </button>
            <button
              onClick={handleCreateAnother}
              className="flex-1 bg-white text-gray-700 px-4 py-2 rounded-md font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
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
    </div>
  );
}
