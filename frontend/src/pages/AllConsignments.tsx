import { useEffect, useState } from 'react';
import ConsignmentTable from '../components/ConsignmentTable';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiClient } from '../services/apiClient';
import type { Consignment } from '../stores/useConsignmentStore';

type StatusFilter = 'all' | 'Draft' | 'In Transit' | 'Received';

export default function AllConsignments() {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    loadAllConsignments();
  }, []);

  const loadAllConsignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all consignments without operator filter
      const response = await apiClient.getAllConsignments();
      setConsignments(response.consignments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load consignments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">My Consignments</h1>
          <p className="text-blue-100">View all EMCS consignments in the system</p>
        </div>
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">My Consignments</h1>
          <p className="text-blue-100">View all EMCS consignments in the system</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Consignments</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadAllConsignments}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Filter consignments by status
  const filteredConsignments =
    statusFilter === 'all' ? consignments : consignments.filter((c) => c.status === statusFilter);

  const getFilterButtonClass = (filter: StatusFilter) => {
    const baseClass =
      'px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm min-h-[44px] flex items-center justify-center shadow-md';
    const activeClass = 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg';
    const inactiveClass = 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg';

    return `${baseClass} ${statusFilter === filter ? activeClass : inactiveClass}`;
  };

  return (
    <div>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Consignments</h1>
        <p className="text-blue-100">View all EMCS consignments in the system (Mock Data)</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-gray-400">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{consignments.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-gray-500">
          <p className="text-sm text-gray-600 mb-1">Draft</p>
          <p className="text-2xl font-bold text-gray-700">
            {consignments.filter((c) => c.status === 'Draft').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">In Transit</p>
          <p className="text-2xl font-bold text-blue-600">
            {consignments.filter((c) => c.status === 'In Transit').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Received</p>
          <p className="text-2xl font-bold text-green-600">
            {consignments.filter((c) => c.status === 'Received').length}
          </p>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter('all')} className={getFilterButtonClass('all')}>
          All
        </button>
        <button
          onClick={() => setStatusFilter('Draft')}
          className={getFilterButtonClass('Draft')}
        >
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
        <p className="text-gray-700 font-medium">
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
            onActionComplete={loadAllConsignments}
          />
        </div>
      )}
    </div>
  );
}
