import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiClient, type MovementEvent } from '../services/apiClient';
import type { Consignment } from '../stores/useConsignmentStore';
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Consignment Details</h1>
            <p className="text-blue-100 font-mono text-sm">ARC: {consignment.arc}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${getStatusColor(consignment.status)}`}
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

        {/* Beer Packaging Details */}
        {consignment.goodsType === 'Beer' && consignment.beerPackaging && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
              </svg>
              Beer Packaging Details (EU Code: 2203)
            </h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Container Type</p>
                  <p className="font-medium text-gray-900">Cans</p>
                </div>
                <div>
                  <p className="text-gray-600">Can Size</p>
                  <p className="font-medium text-gray-900">
                    {consignment.beerPackaging.canSize} ml
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Cans per Package</p>
                  <p className="font-medium text-gray-900">
                    {consignment.beerPackaging.cansPerPackage}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Number of Packages</p>
                  <p className="font-medium text-gray-900">
                    {consignment.beerPackaging.numberOfPackages}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-amber-300">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Cans:</span>
                  <span className="text-xl font-bold text-amber-600">
                    {consignment.beerPackaging.totalCans?.toLocaleString() ||
                      (
                        consignment.beerPackaging.cansPerPackage *
                        consignment.beerPackaging.numberOfPackages
                      ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg font-bold text-gray-900">Total Liters:</span>
                  <span className="text-xl font-bold text-amber-600">
                    {consignment.beerPackaging.totalLiters?.toFixed(1) ||
                      (
                        (consignment.beerPackaging.canSize / 1000) *
                        consignment.beerPackaging.cansPerPackage *
                        consignment.beerPackaging.numberOfPackages
                      ).toFixed(1)}{' '}
                    L
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Parties Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Parties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Consignor */}
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Consignor</p>
            {consignment.consignorInfo ? (
              <div className="space-y-1">
                <p className="text-base font-medium text-gray-900">
                  {consignment.consignorInfo.companyName}
                </p>
                <p className="text-sm text-gray-600">
                  SEED: {consignment.consignorInfo.seedNumber}
                </p>
                <p className="text-sm text-gray-600">VAT: {consignment.consignorInfo.vatNumber}</p>
                <p className="text-sm text-gray-600">{consignment.consignorInfo.address}</p>
                <p className="text-sm text-gray-600">{consignment.consignorInfo.country}</p>
                <p className="text-xs font-mono text-gray-500 break-all mt-2">
                  {consignment.consignor}
                </p>
              </div>
            ) : (
              <p className="text-base font-mono text-gray-900 break-all">{consignment.consignor}</p>
            )}
          </div>

          {/* Consignee */}
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Consignee</p>
            {consignment.consigneeInfo ? (
              <div className="space-y-1">
                <p className="text-base font-medium text-gray-900">
                  {consignment.consigneeInfo.companyName}
                </p>
                <p className="text-sm text-gray-600">
                  SEED: {consignment.consigneeInfo.seedNumber}
                </p>
                <p className="text-sm text-gray-600">VAT: {consignment.consigneeInfo.vatNumber}</p>
                <p className="text-sm text-gray-600">{consignment.consigneeInfo.address}</p>
                <p className="text-sm text-gray-600">{consignment.consigneeInfo.country}</p>
                <p className="text-xs font-mono text-gray-500 break-all mt-2">
                  {consignment.consignee}
                </p>
              </div>
            ) : (
              <p className="text-base font-mono text-gray-900 break-all">{consignment.consignee}</p>
            )}
          </div>
        </div>
      </div>

      {/* Transport Details Section */}
      {(consignment.transportMode ||
        consignment.vehicleLicensePlate ||
        consignment.containerNumber) && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Transport Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {consignment.transportMode && (
              <div>
                <p className="text-sm text-gray-500">Transport Mode</p>
                <p className="text-base font-medium text-gray-900">{consignment.transportMode}</p>
              </div>
            )}
            {consignment.vehicleLicensePlate && (
              <div>
                <p className="text-sm text-gray-500">Vehicle License Plate</p>
                <p className="text-base font-medium text-gray-900">
                  {consignment.vehicleLicensePlate}
                </p>
              </div>
            )}
            {consignment.containerNumber && (
              <div>
                <p className="text-sm text-gray-500">Container Number</p>
                <p className="text-base font-medium text-gray-900">{consignment.containerNumber}</p>
              </div>
            )}
          </div>
        </div>
      )}

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
