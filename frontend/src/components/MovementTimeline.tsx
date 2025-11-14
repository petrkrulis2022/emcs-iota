import type { MovementEvent } from '../services/apiClient';

interface MovementTimelineProps {
  events: MovementEvent[];
}

export default function MovementTimeline({ events }: MovementTimelineProps) {
  // Sort events chronologically (oldest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Created':
        return (
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'Dispatched':
        return (
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        );
      case 'Received':
        return (
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return (
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'Created':
        return 'bg-gray-100 border-gray-300';
      case 'Dispatched':
        return 'bg-blue-100 border-blue-300';
      case 'Received':
        return 'bg-green-100 border-green-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 13) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (transactionId: string) => {
    // IOTA testnet explorer URL - adjust based on actual explorer
    return `https://explorer.iota.org/transaction/${transactionId}`;
  };

  if (sortedEvents.length === 0) {
    return <div className="text-center text-gray-500 py-8">No movement events recorded yet.</div>;
  }

  return (
    <div className="space-y-6">
      {sortedEvents.map((event, index) => (
        <div key={index} className="relative">
          {/* Timeline line */}
          {index < sortedEvents.length - 1 && (
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-300" />
          )}

          {/* Event card */}
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getEventColor(event.type)}`}
            >
              {getEventIcon(event.type)}
            </div>

            {/* Event details */}
            <div className="flex-1 bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{event.type}</h3>
                <span className="text-sm text-gray-500">{formatTimestamp(event.timestamp)}</span>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Actor:</span>{' '}
                  <span className="font-mono text-gray-900">{truncateAddress(event.actor)}</span>
                </div>

                <div>
                  <span className="text-gray-500">Transaction:</span>{' '}
                  <a
                    href={getExplorerUrl(event.transactionId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {truncateAddress(event.transactionId)}
                  </a>
                </div>

                {event.documentHash && (
                  <div>
                    <span className="text-gray-500">Document Hash:</span>{' '}
                    <span className="font-mono text-gray-900 break-all">{event.documentHash}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
