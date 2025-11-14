import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiClient, MovementEvent } from '../services/apiClient';
import { Consignment } from '../stores/useConsignmentStore';
import { useWalletStore } from '../stores/useWalletStore';
import QRCodeDisplay from '../components/QRCodeDisplay';
import MovementTimeline from '../components/MovementTimeline';
import SkeletonLoader from '../components/SkeletonLoader';
import LoadingSpinner from '../components/LoadingSpinner';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';

export default function ConsignmentDetail() {
  const { arc } = useParams<{ arc: string }>();
  const { walletAddress } = useWalletStore();
  const [consignment, setConsignment] = useState<Consignment | null>(null);
  const [events, setEvents] = useState<MovementEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!arc) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch consignment data and events in parallel
        const [consignmentData, eventsData] = await Promise.all([
          apiClient.getConsignment(arc),
          apiClient.getConsignmentEvents(arc),
        ]);

        setConsignment(consignmentData);
        setEvents(eventsData.events);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load consignment';
        setError(errorMessage);

        // Check if it's a 404 error
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          setError('Consignment not found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [arc]);

  const handleDispatch = async () => {
    if (!walletAddress || !arc) return;

    setActionLoading(true);

    try {
      const response = await apiClient.dispatchConsignment(arc, walletAddress);
      showSuccessNotification('Consignment dispatched successfully!', response.transactionId);

      // Refresh consignment data
      const [consignmentData, eventsData] = await Promise.all([
        apiClient.getConsignment(arc),
        apiClient.getConsignmentEvents(arc),
      ]);
      setConsignment(consignmentData);
      setEvents(eventsData.events);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to dispatch consignment';
      showErrorNotification(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceive = async () => {
    if (!walletAddress || !arc) return;

    setActionLoading(true);

    try {
      const response = await apiClient.receiveConsignment(arc, walletAddress);
      showSuccessNotification('Consignment received successfully!', response.transactionId);

      // Refresh consignment data
      const [consignmentData, eventsData] = await Promise.all([
        apiClient.getConsignment(arc),
        apiClient.getConsignmentEvents(arc),
      ]);
      setConsignment(consignmentData);
      setEvents(eventsData.events);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm receipt';
      showErrorNotification(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="detail" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!consignment) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-yellow-800 mb-2">Not Found</h2>
        <p className="text-yellow-600">Consignment not found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Received':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canDispatch = consignment.status === 'Draft' && walletAddress === consignment.consignor;
  const canReceive = consignment.status === 'In Transit' && walletAddress === consignment.consignee;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Consignment Details</h1>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(consignment.status)}`}
          >
            {consignment.status}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {(canDispatch || canReceive) && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 sm:space-x-4">
            {canDispatch && (
              <button
                onClick={handleDispatch}
                disabled={actionLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2 min-h-[44px] w-full sm:w-auto"
              >
                {actionLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <span>Dispatch Consignment</span>
                )}
              </button>
            )}
            {canReceive && (
              <button
                onClick={handleReceive}
                disabled={actionLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2 min-h-[44px] w-full sm:w-auto"
              >
                {actionLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <span>Confirm Receipt</span>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* QR Code Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 text-center">QR Code</h2>
        <div className="flex justify-center">
          <QRCodeDisplay arc={consignment.arc} />
        </div>
      </div>

      {/* Shipment Information Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Shipment Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Goods Type</p>
            <p className="text-base font-medium text-gray-900">{consignment.goodsType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Quantity</p>
            <p className="text-base font-medium text-gray-900">
              {consignment.quantity} {consignment.unit}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Origin</p>
            <p className="text-base font-medium text-gray-900">{consignment.origin}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Destination</p>
            <p className="text-base font-medium text-gray-900">{consignment.destination}</p>
          </div>
        </div>
      </div>

      {/* Parties Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Parties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Consignor</p>
            <p className="text-base font-mono text-gray-900 break-all">{consignment.consignor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Consignee</p>
            <p className="text-base font-mono text-gray-900 break-all">{consignment.consignee}</p>
          </div>
        </div>
      </div>

      {/* Timestamps Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="text-base font-medium text-gray-900">
              {new Date(consignment.createdAt).toLocaleString()}
            </p>
          </div>
          {consignment.dispatchedAt && (
            <div>
              <p className="text-sm text-gray-500">Dispatched At</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(consignment.dispatchedAt).toLocaleString()}
              </p>
            </div>
          )}
          {consignment.receivedAt && (
            <div>
              <p className="text-sm text-gray-500">Received At</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(consignment.receivedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
        {consignment.documentHash && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Document Hash</p>
            <p className="text-base font-mono text-gray-900 break-all">
              {consignment.documentHash}
            </p>
          </div>
        )}
      </div>

      {/* Movement History Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
          Movement History
        </h2>
        <MovementTimeline events={events} />
      </div>
    </div>
  );
}
