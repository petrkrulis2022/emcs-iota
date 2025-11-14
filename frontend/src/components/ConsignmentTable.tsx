import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Consignment } from '../stores/useConsignmentStore';
import { useWalletStore } from '../stores/useWalletStore';
import { apiClient } from '../services/apiClient';
import LoadingSpinner from './LoadingSpinner';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';

interface ConsignmentTableProps {
  consignments: Consignment[];
  onActionComplete?: () => void;
}

export default function ConsignmentTable({
  consignments,
  onActionComplete,
}: ConsignmentTableProps) {
  const navigate = useNavigate();
  const { walletAddress, isConnected } = useWalletStore();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const truncateAddress = (address: string): string => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      Draft: 'bg-gray-100 text-gray-800',
      'In Transit': 'bg-blue-100 text-blue-800',
      Received: 'bg-green-100 text-green-800',
    };

    const className =
      statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{status}</span>
    );
  };

  const handleRowClick = (arc: string, e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/consignment/${arc}`);
  };

  const handleDispatch = async (arc: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!walletAddress) {
      showErrorNotification('Please connect your wallet');
      return;
    }

    setLoadingAction(`dispatch-${arc}`);

    try {
      const response = await apiClient.dispatchConsignment(arc, walletAddress);
      showSuccessNotification('Consignment dispatched successfully!', response.transactionId);

      // Refresh consignment list
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to dispatch consignment';
      showErrorNotification(message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReceive = async (arc: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!walletAddress) {
      showErrorNotification('Please connect your wallet');
      return;
    }

    setLoadingAction(`receive-${arc}`);

    try {
      const response = await apiClient.receiveConsignment(arc, walletAddress);
      showSuccessNotification('Consignment received successfully!', response.transactionId);

      // Refresh consignment list
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to confirm receipt';
      showErrorNotification(message);
    } finally {
      setLoadingAction(null);
    }
  };

  const canDispatch = (consignment: Consignment): boolean => {
    return (
      isConnected &&
      consignment.status === 'Draft' &&
      walletAddress?.toLowerCase() === consignment.consignor.toLowerCase()
    );
  };

  const canReceive = (consignment: Consignment): boolean => {
    return (
      isConnected &&
      consignment.status === 'In Transit' &&
      walletAddress?.toLowerCase() === consignment.consignee.toLowerCase()
    );
  };

  const renderActionButton = (consignment: Consignment) => {
    if (canDispatch(consignment)) {
      const isLoading = loadingAction === `dispatch-${consignment.arc}`;
      return (
        <button
          onClick={e => handleDispatch(consignment.arc, e)}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 min-h-[44px]"
        >
          {isLoading && <LoadingSpinner size="sm" color="white" />}
          <span>{isLoading ? 'Dispatching...' : 'Dispatch'}</span>
        </button>
      );
    }

    if (canReceive(consignment)) {
      const isLoading = loadingAction === `receive-${consignment.arc}`;
      return (
        <button
          onClick={e => handleReceive(consignment.arc, e)}
          disabled={isLoading}
          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-1 min-h-[44px]"
        >
          {isLoading && <LoadingSpinner size="sm" color="white" />}
          <span>{isLoading ? 'Confirming...' : 'Confirm Receipt'}</span>
        </button>
      );
    }

    return null;
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ARC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Goods Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Consignor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Consignee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {consignments.map(consignment => (
              <tr
                key={consignment.arc}
                onClick={e => handleRowClick(consignment.arc, e)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {consignment.arc}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {consignment.goodsType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {consignment.quantity} {consignment.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getStatusBadge(consignment.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {truncateAddress(consignment.consignor)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {truncateAddress(consignment.consignee)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(consignment.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {renderActionButton(consignment)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {consignments.map(consignment => (
          <div
            key={consignment.arc}
            onClick={e => handleRowClick(consignment.arc, e)}
            className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="font-medium text-blue-600 text-sm">{consignment.arc}</div>
              {getStatusBadge(consignment.status)}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Goods:</span>
                <span className="text-gray-900 font-medium">{consignment.goodsType}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Quantity:</span>
                <span className="text-gray-900">
                  {consignment.quantity} {consignment.unit}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Consignor:</span>
                <span className="text-gray-900 font-mono text-xs">
                  {truncateAddress(consignment.consignor)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Consignee:</span>
                <span className="text-gray-900 font-mono text-xs">
                  {truncateAddress(consignment.consignee)}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900">{formatDate(consignment.createdAt)}</span>
              </div>

              {/* Action Button for Mobile */}
              {renderActionButton(consignment) && (
                <div className="pt-3 border-t border-gray-100">
                  {renderActionButton(consignment)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
