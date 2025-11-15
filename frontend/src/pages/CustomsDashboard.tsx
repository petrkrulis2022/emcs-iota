import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Consignment } from '../stores/useConsignmentStore';
import { apiClient } from '../services/apiClient';
import SkeletonLoader from '../components/SkeletonLoader';
import ConsignmentPrintPDF from '../components/ConsignmentPrintPDF';

type DirectionFilter = 'all' | 'exports' | 'imports';
type StatusFilter = 'all' | 'active' | 'in-transit' | 'closed';

export default function CustomsDashboard() {
  const navigate = useNavigate();
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedConsignment, setSelectedConsignment] = useState<Consignment | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const customsWallet = localStorage.getItem('customsWallet');
  const isCustomsAuthority = localStorage.getItem('isCustomsAuthority') === 'true';

  useEffect(() => {
    // Check authentication
    if (!customsWallet || !isCustomsAuthority) {
      navigate('/customs-login', { replace: true });
      return;
    }

    loadAllConsignments();
  }, [customsWallet, isCustomsAuthority, navigate]);

  const loadAllConsignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getAllConsignments();
      setConsignments(response.consignments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load consignments');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customsWallet');
    localStorage.removeItem('isCustomsAuthority');
    navigate('/customs-login');
  };

  const handleViewPDF = (consignment: Consignment) => {
    setSelectedConsignment(consignment);
    setShowPrintModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const getFilteredConsignments = () => {
    let filtered = [...consignments];

    // Direction filter (exports/imports from Ireland's perspective)
    if (directionFilter === 'exports') {
      // Exports: Origin is Ireland
      filtered = filtered.filter(c => c.origin?.toLowerCase().includes('ireland'));
    } else if (directionFilter === 'imports') {
      // Imports: Destination is Ireland
      filtered = filtered.filter(c => c.destination?.toLowerCase().includes('ireland'));
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(c => c.status === 'Draft');
    } else if (statusFilter === 'in-transit') {
      filtered = filtered.filter(c => c.status === 'In Transit');
    } else if (statusFilter === 'closed') {
      filtered = filtered.filter(c => c.status === 'Received');
    }

    // Date filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(c => new Date(c.createdAt) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59); // End of day
      filtered = filtered.filter(c => new Date(c.createdAt) <= toDate);
    }

    return filtered;
  };

  const filteredConsignments = getFilteredConsignments();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      Draft: 'bg-gray-100 text-gray-800 border-gray-300',
      'In Transit': 'bg-blue-100 text-blue-800 border-blue-300',
      Received: 'bg-green-100 text-green-800 border-green-300',
    };

    const className =
      statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800 border-gray-300';

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${className}`}>
        {status}
      </span>
    );
  };

  // Don't render if not authenticated
  if (!customsWallet || !isCustomsAuthority) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6 shadow-lg">
          <h1 className="text-3xl font-bold">Loading Customs Dashboard...</h1>
        </div>
        <div className="max-w-7xl mx-auto p-6">
          <SkeletonLoader type="table" count={5} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 print:hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">🇮🇪 Irish Revenue Customs Portal</h1>
              <p className="text-emerald-100">EMCS Monitoring & Oversight System</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-emerald-600 px-6 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Officer Info */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Customs Officer Portal</h2>
                <p className="text-sm text-gray-600">Irish Revenue Commissioners</p>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  ID: {customsWallet?.slice(0, 10)}...{customsWallet?.slice(-8)}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Department:</span>
                <p className="font-semibold text-gray-900">Customs Division</p>
              </div>
              <div>
                <span className="text-gray-600">Location:</span>
                <p className="font-semibold text-gray-900">Castle House, Dublin 2</p>
              </div>
              <div>
                <span className="text-gray-600">Contact:</span>
                <p className="font-semibold text-gray-900">+353 1 647 5000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Consignments</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Direction Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direction
                </label>
                <select
                  value={directionFilter}
                  onChange={(e) => setDirectionFilter(e.target.value as DirectionFilter)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Movements</option>
                  <option value="exports">🇮🇪 Exports (From Ireland)</option>
                  <option value="imports">🇮🇪 Imports (To Ireland)</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active (Draft)</option>
                  <option value="in-transit">In Transit</option>
                  <option value="closed">Closed (Received)</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <strong>{filteredConsignments.length}</strong> of <strong>{consignments.length}</strong> consignments
              </p>
              <button
                onClick={() => {
                  setDirectionFilter('all');
                  setStatusFilter('all');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Consignments Table */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Consignments</h3>
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredConsignments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No consignments found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredConsignments.map((consignment) => (
                    <tr key={consignment.arc} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                        {consignment.arc}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {consignment.goodsType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">From:</span>
                          <span className="font-medium">{consignment.origin}</span>
                          <span className="text-xs text-gray-500 mt-1">To:</span>
                          <span className="font-medium">{consignment.destination}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {consignment.quantity} {consignment.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(consignment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(consignment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewPDF(consignment)}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && selectedConsignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto print:relative print:z-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 print:hidden" onClick={() => setShowPrintModal(false)}></div>
          
          <div className="flex min-h-full items-center justify-center p-4 print:p-0">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 print:shadow-none print:max-w-none">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4 print:hidden">
                <h3 className="text-xl font-bold text-gray-900">Consignment Details</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrint}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
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
                    onClick={() => setShowPrintModal(false)}
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
              <ConsignmentPrintPDF consignment={selectedConsignment} showOnScreen={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
