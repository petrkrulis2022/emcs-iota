import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import OfficerVerificationPanel from '../components/OfficerVerificationPanel';

const OfficerVerification = () => {
  const [searchParams] = useSearchParams();
  const arcFromUrl = searchParams.get('arc');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Revenue Officer Portal
          </h1>
          <p className="text-gray-600">
            Verify consignment authenticity against blockchain records
          </p>
        </div>
        
        <OfficerVerificationPanel initialArc={arcFromUrl || ''} />
      </div>
    </div>
  );
};

export default OfficerVerification;
