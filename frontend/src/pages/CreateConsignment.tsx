import { useState } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import { useCurrentAccount } from '@iota/dapp-kit';
import { apiClient } from '../services/apiClient';
import { useBlockchainTransaction } from '../hooks/useBlockchainTransaction';
import ConsignmentForm, { type ConsignmentFormData } from '../components/ConsignmentForm';
import SuccessModal from '../components/SuccessModal';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';

export default function CreateConsignment() {
  const { walletAddress } = useWalletStore();
  const currentAccount = useCurrentAccount();
  const { createConsignment: createOnBlockchain } = useBlockchainTransaction();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdArc, setCreatedArc] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0); // Key to force form reset

  const handleSubmit = async (formData: ConsignmentFormData) => {
    if (!walletAddress) {
      showErrorNotification('Please connect your wallet first');
      return;
    }

    if (!currentAccount) {
      showErrorNotification('Please connect your IOTA Wallet to create blockchain transactions');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Call backend API to create consignment (it generates ARC and saves to DB)
      const response = await apiClient.createConsignment({
        consignor: walletAddress,
        consignee: formData.consignee,
        goodsType: formData.goodsType,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        origin: formData.origin,
        destination: formData.destination,
        transportModes: formData.transportModes,
        vehicleLicensePlate: formData.vehicleLicensePlate,
        containerNumber: formData.containerNumber,
        beerPackaging: formData.beerPackaging,
        beerName: formData.beerName,
        alcoholPercentage: formData.alcoholPercentage ? parseFloat(formData.alcoholPercentage) : undefined,
      });

      const arc = response.arc;

      // Step 2: Show notification to approve wallet transaction
      showSuccessNotification('Please approve the blockchain transaction in your wallet...', arc);

      // Step 3: Create consignment on blockchain (wallet popup will appear here!)
      const blockchainResult = await createOnBlockchain({
        arc,
        consignee: formData.consignee,
        goodsType: formData.goodsType,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        origin: formData.origin,
        destination: formData.destination,
        beerName: formData.beerName,
        alcoholPercentage: formData.alcoholPercentage ? parseFloat(formData.alcoholPercentage) : undefined,
      });

      console.log('✅ Blockchain transaction successful!');
      console.log('   Digest:', blockchainResult.digest);
      console.log('   Object ID:', blockchainResult.consignmentId);

      // Store response data
      setCreatedArc(arc);
      setTransactionId(blockchainResult.digest);

      // Show success notification
      showSuccessNotification('Consignment created on blockchain!', blockchainResult.digest);

      // Show success modal
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Error creating consignment:', err);

      // Handle different error types
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (err.message?.includes('User rejected') || err.message?.includes('rejected')) {
        errorMessage = 'Transaction rejected. Please approve the transaction in your wallet.';
      } else if (err.message?.includes('Insufficient')) {
        errorMessage = 'Insufficient IOTA tokens. Please get testnet tokens from the faucet.';
      } else if (err.message?.includes('400')) {
        errorMessage = 'Validation error: Please check your input and try again.';
      } else if (err.message?.includes('500')) {
        errorMessage = 'Blockchain error: Unable to create consignment. Please try again.';
      } else if (err.message?.includes('Network error')) {
        errorMessage = 'Network error: Unable to reach the server. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      showErrorNotification(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccess = (arc: string, txId: string) => {
    setCreatedArc(arc);
    setTransactionId(txId);
    setShowSuccessModal(true);
  };

  const handleCreateAnother = () => {
    // Reset form by changing key
    setFormKey(prev => prev + 1);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Create Consignment</h1>
        <p className="text-blue-100">
          Create a new consignment record for excise goods movement on the blockchain
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      )}

      {/* Consignment Form */}
      <ConsignmentForm
        key={formKey}
        onSuccess={handleSuccess}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        arc={createdArc}
        transactionId={transactionId}
        onClose={handleCloseModal}
        onCreateAnother={handleCreateAnother}
      />
    </div>
  );
}
