import { useEffect, useState } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import { useConsignmentStore } from '../stores/useConsignmentStore';
import ConsignmentTable from '../components/ConsignmentTable';
import SkeletonLoader from '../components/SkeletonLoader';

type StatusFilter = 'all' | 'Draft' | 'In Transit' | 'Received';

export default function Dashboard() {
  const { walletAddress } = useWalletStore();
  const { consignments, loading, fetchConsignments } = useConsignmentStore();
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Fetch consignments on mount and when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      loadConsignments();
    }
  }, [walletAddress]);

  // Polling: refetch every 10 seconds
  useEffect(() => {
    if (!walletAddress) return;

    const interval = setInterval(() => {
      loadConsignments();
    }, 10000);

    return () => clearInterval(interval);
  }, [walletAddress]);

  const loadConsignments = async () => {
    if (!walletAddress) return;

    try {
      setError(null);
      await fetchConsignments(walletAddress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load consignments');
    }
  };

  const handleRetry = () => {
    loadConsignments();
  };

  // Loading state
  if (loading && consignments.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Consignments</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!walletAddress) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">Please connect your wallet to view consignments</p>
        </div>
      </div>
    );
  }

  if (consignments.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No consignments yet</h3>
            <p className="text-gray-600">Create your first consignment to get started</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter consignments by status
  const filteredConsignments =
    statusFilter === 'all' ? consignments : consignments.filter(c => c.status === statusFilter);

  const getFilterButtonClass = (filter: StatusFilter) => {
    const baseClass =
      'px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm min-h-[44px] flex items-center justify-center';
    const activeClass = 'bg-blue-600 text-white';
    const inactiveClass = 'bg-gray-100 text-gray-700 hover:bg-gray-200';

    return `${baseClass} ${statusFilter === filter ? activeClass : inactiveClass}`;
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Dashboard</h1>

      {/* Status Filter Buttons */}
      <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter('all')} className={getFilterButtonClass('all')}>
          All
        </button>
        <button onClick={() => setStatusFilter('Draft')} className={getFilterButtonClass('Draft')}>
          Draft
        </button>
        <button
          onClick={() => setStatusFilter('In Transit')}
          className={getFilterButtonClass('In Transit')}
        >
          In Transit
        </button>
        <button
          onClick={() => setStatusFilter('Received')}
          className={getFilterButtonClass('Received')}
        >
          Received
        </button>
      </div>

      {/* Consignment Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredConsignments.length} of {consignments.length} consignment(s)
        </p>
      </div>

      {/* Consignment Table */}
      {filteredConsignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No consignments found with status: {statusFilter}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ConsignmentTable
            consignments={filteredConsignments}
            onActionComplete={loadConsignments}
          />
        </div>
      )}
    </div>
  );
}
