import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Consignment } from '../stores/useConsignmentStore';
import { apiClient } from '../services/apiClient';
import SkeletonLoader from '../components/SkeletonLoader';
import ConsignmentPrintPDF from '../components/ConsignmentPrintPDF';
import IOTAExplorerModal from '../components/IOTAExplorerModal';
import WalletButton from '../components/WalletButton';

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showIOTAExplorer, setShowIOTAExplorer] = useState(false);

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

  const handleViewDetails = (consignment: Consignment) => {
    setSelectedConsignment(consignment);
    setShowDetailsModal(true);
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
            <div className="flex items-center gap-4">
              {/* IOTA Wallet Connection */}
              <WalletButton />
              <button
                onClick={handleLogout}
                className="bg-white text-emerald-600 px-6 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                Logout
              </button>
            </div>
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
                          onClick={() => handleViewDetails(consignment)}
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

      {/* Details Modal with Blockchain Verification */}
      {showDetailsModal && selectedConsignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-60" onClick={() => setShowDetailsModal(false)}></div>
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">Consignment Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
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

              {/* Consignment Info */}
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">ARC: {selectedConsignment.arc}</h4>
                  <p className="text-sm text-blue-800">
                    Status: <span className="font-medium">{selectedConsignment.status}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Goods Type</p>
                    <p className="text-gray-900">{selectedConsignment.goodsType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Quantity</p>
                    <p className="text-gray-900">{selectedConsignment.quantity} {selectedConsignment.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Origin</p>
                    <p className="text-gray-900">{selectedConsignment.origin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Destination</p>
                    <p className="text-gray-900">{selectedConsignment.destination}</p>
                  </div>
                </div>
              </div>

              {/* Blockchain Verification Section */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-900">Blockchain Verification</h4>
                  <button
                    onClick={() => setShowIOTAExplorer(true)}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Verify on IOTA</span>
                  </button>
                </div>
                {selectedConsignment.documentHash ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">e-AD Document Hash</p>
                    <p className="text-xs font-mono text-gray-700 break-all bg-white p-3 rounded border border-purple-200">
                      {selectedConsignment.documentHash}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-purple-800">
                    This consignment is stored on the IOTA blockchain as an NFT. Click "Verify on IOTA" to view the blockchain metadata and verify the consignment data.
                  </p>
                )}
              </div>

              {/* Revenue Officer Verification Section */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900">Officer Verification</h4>
                    <p className="text-xs text-gray-600">Verify with wallet transaction & view NFT</p>
                  </div>
                  <button
                    onClick={() => {
                      window.open(`/officer-verification?arc=${selectedConsignment.arc}`, '_blank');
                    }}
                    className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Verify as Officer</span>
                  </button>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800 mb-3">
                    <span className="font-semibold">Revenue Officer verification</span> requires connecting a wallet and signing a transaction. This creates an immutable on-chain audit trail and compares PDF/database data against the blockchain NFT.
                  </p>
                  {selectedConsignment.transactionId && !selectedConsignment.transactionId.startsWith('tx_mock') ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Blockchain Transaction ID</p>
                        <p className="text-xs font-mono text-gray-700 break-all bg-gray-50 p-2 rounded border border-gray-200">
                          {selectedConsignment.transactionId}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">NFT created on IOTA blockchain - ready to verify</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Mock consignment - cannot perform blockchain verification</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Print Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowPrintModal(true);
                  }}
                  className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  <span>Print Consignment PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IOTA Explorer Modal */}
      {showIOTAExplorer && selectedConsignment && (
        <IOTAExplorerModal consignment={selectedConsignment} onClose={() => setShowIOTAExplorer(false)} />
      )}
    </>
  );
}
