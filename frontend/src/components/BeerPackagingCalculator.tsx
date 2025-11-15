import { useState, useEffect } from 'react';

interface BeerPackagingData {
  canSize: number;
  cansPerPackage: number;
  numberOfPackages: number;
}

interface BeerPackagingCalculatorProps {
  onChange: (totalLiters: number, packagingData: BeerPackagingData) => void;
}

const CAN_SIZES = [
  { value: 250, label: '250 ml' },
  { value: 330, label: '330 ml (Czech Standard)' },
  { value: 500, label: '500 ml (EU Standard)' },
  { value: 750, label: '750 ml' },
  { value: 1000, label: '1000 ml' },
];

const CANS_PER_PACKAGE = [
  { value: 6, label: '6 cans (6-pack)' },
  { value: 12, label: '12 cans (12-pack)' },
  { value: 24, label: '24 cans (Standard Case)' },
  { value: 30, label: '30 cans' },
  { value: 48, label: '48 cans (Pallet Case)' },
];

export default function BeerPackagingCalculator({ onChange }: BeerPackagingCalculatorProps) {
  const [canSize, setCanSize] = useState<number>(500);
  const [cansPerPackage, setCansPerPackage] = useState<number>(24);
  const [numberOfPackages, setNumberOfPackages] = useState<number>(1);
  const [totalCans, setTotalCans] = useState<number>(0);
  const [totalLiters, setTotalLiters] = useState<number>(0);

  // Calculate totals whenever inputs change
  useEffect(() => {
    const calculatedTotalCans = cansPerPackage * numberOfPackages;
    const canVolumeInLiters = canSize / 1000;
    const calculatedTotalLiters = canVolumeInLiters * calculatedTotalCans;

    setTotalCans(calculatedTotalCans);
    setTotalLiters(calculatedTotalLiters);

    // Notify parent component
    onChange(calculatedTotalLiters, {
      canSize,
      cansPerPackage,
      numberOfPackages,
    });
  }, [canSize, cansPerPackage, numberOfPackages, onChange]);

  const isValid = canSize > 0 && cansPerPackage > 0 && numberOfPackages > 0;
  const isLargeConsignment = totalLiters > 1000000;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg p-4 text-white">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
          </svg>
          <div>
            <h3 className="font-bold text-lg">Beer Packaging Calculator</h3>
            <p className="text-sm text-amber-100">EU Excise Code: 2203</p>
          </div>
        </div>
      </div>

      {/* Packaging Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Can Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Can Size *
          </label>
          <select
            value={canSize}
            onChange={(e) => setCanSize(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
          >
            {CAN_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        {/* Cans per Package */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cans per Package *
          </label>
          <select
            value={cansPerPackage}
            onChange={(e) => setCansPerPackage(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
          >
            {CANS_PER_PACKAGE.map((pack) => (
              <option key={pack.value} value={pack.value}>
                {pack.label}
              </option>
            ))}
          </select>
        </div>

        {/* Number of Packages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Packages *
          </label>
          <input
            type="number"
            min="1"
            max="10000"
            value={numberOfPackages}
            onChange={(e) => setNumberOfPackages(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
            placeholder="Enter number of packages"
          />
        </div>
      </div>

      {/* Summary Box */}
      <div className={`rounded-lg p-4 border-2 ${
        isValid 
          ? isLargeConsignment 
            ? 'bg-yellow-50 border-yellow-400' 
            : 'bg-green-50 border-green-400'
          : 'bg-red-50 border-red-400'
      }`}>
        <h4 className="font-bold text-gray-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z" clipRule="evenodd" />
          </svg>
          BEER CONSIGNMENT SUMMARY
        </h4>
        
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <span className="text-gray-600">Container:</span>
            <span className="ml-2 font-medium text-gray-900">Cans</span>
          </div>
          <div>
            <span className="text-gray-600">Can Size:</span>
            <span className="ml-2 font-medium text-gray-900">{canSize} ml</span>
          </div>
          <div>
            <span className="text-gray-600">Cans per Package:</span>
            <span className="ml-2 font-medium text-gray-900">{cansPerPackage}</span>
          </div>
          <div>
            <span className="text-gray-600">Packages:</span>
            <span className="ml-2 font-medium text-gray-900">{numberOfPackages}</span>
          </div>
        </div>

        <div className="border-t-2 border-gray-300 pt-3 mt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-bold text-gray-900">TOTAL CANS:</span>
            <span className="text-2xl font-bold text-amber-600">{totalCans.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">TOTAL LITERS:</span>
            <span className="text-2xl font-bold text-amber-600">{totalLiters.toFixed(1)} L</span>
          </div>
        </div>

        {/* Status */}
        <div className="mt-3 pt-3 border-t-2 border-gray-300">
          {!isValid && (
            <div className="flex items-center text-red-600">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">⚠️ Complete all fields to calculate</span>
            </div>
          )}
          {isValid && isLargeConsignment && (
            <div className="flex items-center text-yellow-700">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">⚠️ Very large consignment - verify quantity</span>
            </div>
          )}
          {isValid && !isLargeConsignment && (
            <div className="flex items-center text-green-600">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">✓ Valid for consignment</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <p className="font-semibold text-blue-900 mb-1">Quick Reference:</p>
        <ul className="text-blue-800 space-y-1">
          <li>• Czech Standard: 330ml × 24 cans = 7.92 L per package</li>
          <li>• EU Standard: 500ml × 24 cans = 12 L per package</li>
          <li>• Typical Order: 100 packages = 2,400 cans = 792 L (Czech) or 1,200 L (EU)</li>
        </ul>
      </div>
    </div>
  );
}
