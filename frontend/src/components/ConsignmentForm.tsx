import { useState, FormEvent, ChangeEvent } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import LoadingSpinner from './LoadingSpinner';
import BeerPackagingCalculator from './BeerPackagingCalculator';
import IOTAIdentityCard from './IOTAIdentityCard';

interface ConsignmentFormProps {
  onSuccess: (arc: string, transactionId: string) => void;
  onSubmit: (formData: ConsignmentFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface BeerPackagingData {
  canSize: number;
  cansPerPackage: number;
  numberOfPackages: number;
}

export interface ConsignmentFormData {
  consignee: string;
  goodsType: string;
  quantity: string;
  unit: string;
  origin: string;
  destination: string;
  transportModes: string[];
  vehicleLicensePlate?: string;
  containerNumber?: string;
  beerPackaging?: BeerPackagingData;
  beerName?: string;
  alcoholPercentage?: string;
  exciseDutyAmount?: number;
}

interface FormErrors {
  consignee?: string;
  goodsType?: string;
  quantity?: string;
  unit?: string;
  origin?: string;
  destination?: string;
}

const GOODS_TYPES = ['Wine', 'Beer', 'Spirits', 'Tobacco', 'Energy'];
const UNITS = ['Liters', 'Kilograms', 'Units'];
const TRANSPORT_MODES = ['Road', 'Rail', 'Sea'];

// Basic IOTA address validation (0x followed by hex characters)
const isValidIOTAAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(address);
};

export default function ConsignmentForm({
  onSuccess,
  onSubmit,
  isSubmitting,
}: ConsignmentFormProps) {
  const { isConnected, walletAddress } = useWalletStore();

  const [formData, setFormData] = useState<ConsignmentFormData>({
    consignee: '',
    goodsType: '',
    quantity: '',
    unit: '',
    origin: '',
    destination: '',
    transportModes: [],
    vehicleLicensePlate: '',
    containerNumber: '',
    beerName: '',
    alcoholPercentage: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [beerPackagingData, setBeerPackagingData] = useState<BeerPackagingData | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-add 0x prefix to consignee address if missing
    let processedValue = value;
    if (name === 'consignee' && value && !value.startsWith('0x') && value.length > 0) {
      // Only add if it looks like a hex address (starts with valid hex chars)
      if (/^[a-fA-F0-9]/.test(value)) {
        processedValue = '0x' + value;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));

    // If goods type changes to Beer, set unit to Liters
    if (name === 'goodsType' && value === 'Beer') {
      setFormData(prev => ({ ...prev, unit: 'Liters' }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTransportModeChange = (mode: string) => {
    setFormData(prev => {
      const currentModes = prev.transportModes || [];
      const isSelected = currentModes.includes(mode);
      
      return {
        ...prev,
        transportModes: isSelected
          ? currentModes.filter(m => m !== mode)
          : [...currentModes, mode]
      };
    });
  };

  const handleBeerPackagingChange = (totalLiters: number, packagingData: BeerPackagingData) => {
    setBeerPackagingData(packagingData);
    setFormData(prev => ({
      ...prev,
      beerPackaging: packagingData,
      quantity: totalLiters.toFixed(1),
      unit: 'Liters',
    }));
  };

  // Auto-populate origin from consignor identity
  const handleConsignorIdentityResolved = (identity: any) => {
    if (identity?.verifiableCredentials) {
      const vc = identity.verifiableCredentials;
      const originLocation = `${vc.address}, ${vc.city}, ${vc.country}`;
      setFormData(prev => ({ ...prev, origin: originLocation }));
    }
  };

  // Auto-populate destination from consignee identity
  const handleConsigneeIdentityResolved = (identity: any) => {
    if (identity?.verifiableCredentials) {
      const vc = identity.verifiableCredentials;
      const destinationLocation = `${vc.address}, ${vc.city}, ${vc.country}`;
      setFormData(prev => ({ ...prev, destination: destinationLocation }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Calculate Irish excise duty for beer
  const calculateExciseDuty = (): number | null => {
    if (formData.goodsType !== 'Beer') return null;
    if (!formData.quantity || !formData.alcoholPercentage) return null;
    
    const quantity = parseFloat(formData.quantity);
    const abv = parseFloat(formData.alcoholPercentage);
    
    if (quantity <= 0 || abv <= 0) return null;
    
    // Convert liters to hectolitres
    const hectolitres = quantity / 100;
    
    // Determine rate based on ABV threshold (2.8%)
    const ratePerHl = abv <= 2.8 ? 11.27 : 22.55;
    
    // Calculate duty: Rate × hectolitres × ABV
    const duty = ratePerHl * hectolitres * abv;
    
    return duty;
  };

  const exciseDuty = calculateExciseDuty();

  const validateField = (field: string): boolean => {
    const newErrors: FormErrors = { ...errors };
    let isValid = true;

    switch (field) {
      case 'consignee':
        if (!formData.consignee) {
          newErrors.consignee = 'Consignee address is required';
          isValid = false;
        } else if (!isValidIOTAAddress(formData.consignee)) {
          newErrors.consignee =
            'Invalid IOTA address format (must be 0x followed by 64 hex characters)';
          isValid = false;
        } else {
          delete newErrors.consignee;
        }
        break;

      case 'goodsType':
        if (!formData.goodsType) {
          newErrors.goodsType = 'Goods type is required';
          isValid = false;
        } else {
          delete newErrors.goodsType;
        }
        break;

      case 'quantity':
        if (!formData.quantity) {
          newErrors.quantity = 'Quantity is required';
          isValid = false;
        } else if (parseFloat(formData.quantity) <= 0) {
          newErrors.quantity = 'Quantity must be greater than 0';
          isValid = false;
        } else {
          delete newErrors.quantity;
        }
        break;

      case 'unit':
        if (!formData.unit) {
          newErrors.unit = 'Unit is required';
          isValid = false;
        } else {
          delete newErrors.unit;
        }
        break;

      case 'origin':
        if (!formData.origin) {
          newErrors.origin = 'Origin is required';
          isValid = false;
        } else {
          delete newErrors.origin;
        }
        break;

      case 'destination':
        if (!formData.destination) {
          newErrors.destination = 'Destination is required';
          isValid = false;
        } else {
          delete newErrors.destination;
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateForm = (): boolean => {
    const fields = ['consignee', 'goodsType', 'quantity', 'unit', 'origin', 'destination'];
    let isValid = true;

    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    // Mark all fields as touched to show errors
    const allTouched = fields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(allTouched);

    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isConnected || !walletAddress) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Calculate and add excise duty for beer consignments
    const submissionData = { ...formData };
    if (formData.goodsType === 'Beer' && formData.alcoholPercentage && formData.quantity) {
      const dutyAmount = calculateExciseDuty();
      if (dutyAmount !== null) {
        submissionData.exciseDutyAmount = dutyAmount;
      }
    }

    await onSubmit(submissionData);
  };

  const isFormValid = () => {
    const baseValid = (
      isConnected &&
      formData.consignee &&
      formData.goodsType &&
      formData.quantity &&
      parseFloat(formData.quantity) > 0 &&
      formData.unit &&
      formData.origin &&
      formData.destination &&
      isValidIOTAAddress(formData.consignee) &&
      Object.keys(errors).length === 0
    );

    // Debug logging
    console.log('Form Validation Debug:', {
      isConnected,
      consignee: formData.consignee,
      goodsType: formData.goodsType,
      quantity: formData.quantity,
      unit: formData.unit,
      origin: formData.origin,
      destination: formData.destination,
      isValidAddress: isValidIOTAAddress(formData.consignee),
      errorsCount: Object.keys(errors).length,
      errors: errors,
      baseValid,
      beerName: formData.beerName,
      alcoholPercentage: formData.alcoholPercentage,
    });

    // Additional validation for beer consignments
    if (formData.goodsType === 'Beer') {
      const beerValid = baseValid && 
        formData.beerName && 
        formData.alcoholPercentage && 
        parseFloat(formData.alcoholPercentage) > 0 &&
        parseFloat(formData.alcoholPercentage) <= 100;
      
      console.log('Beer Validation:', {
        beerValid,
        hasBeerName: !!formData.beerName,
        hasAlcohol: !!formData.alcoholPercentage,
        alcoholValue: parseFloat(formData.alcoholPercentage),
      });
      
      return beerValid;
    }

    return baseValid;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6"
    >
      {/* Consignor (Connected Wallet) - IOTA Identity */}
      {walletAddress && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Consignor (Your Identity)
          </label>
          <IOTAIdentityCard
            walletAddress={walletAddress}
            label="Consignor"
            onIdentityResolved={handleConsignorIdentityResolved}
          />
        </div>
      )}

      {/* Consignee Address */}
      <div>
        <label htmlFor="consignee" className="block text-sm font-medium text-gray-700 mb-1">
          Consignee Wallet Address *
        </label>
        <input
          type="text"
          id="consignee"
          name="consignee"
          value={formData.consignee}
          onChange={handleChange}
          onBlur={() => handleBlur('consignee')}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] ${
            touched.consignee && errors.consignee ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="0x7db01866e872de911ee8d7632a6b30452e97f6ef206504aa534577391e02606a"
        />
        {touched.consignee && errors.consignee && (
          <p className="mt-1 text-sm text-red-600">{errors.consignee}</p>
        )}
      </div>

      {/* Consignee IOTA Identity */}
      {formData.consignee && isValidIOTAAddress(formData.consignee) && (
        <div>
          <IOTAIdentityCard
            walletAddress={formData.consignee}
            label="Consignee"
            onIdentityResolved={handleConsigneeIdentityResolved}
          />
        </div>
      )}

      {/* Goods Type */}
      <div>
        <label htmlFor="goodsType" className="block text-sm font-medium text-gray-700 mb-1">
          Goods Type *
        </label>
        <select
          id="goodsType"
          name="goodsType"
          value={formData.goodsType}
          onChange={handleChange}
          onBlur={() => handleBlur('goodsType')}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] ${
            touched.goodsType && errors.goodsType ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select goods type</option>
          {GOODS_TYPES.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {touched.goodsType && errors.goodsType && (
          <p className="mt-1 text-sm text-red-600">{errors.goodsType}</p>
        )}
      </div>

      {/* Beer Packaging Calculator - Show only when Beer is selected */}
      {formData.goodsType === 'Beer' && (
        <>
          <BeerPackagingCalculator onChange={handleBeerPackagingChange} />
          
          {/* Beer Name */}
          <div>
            <label htmlFor="beerName" className="block text-sm font-medium text-gray-700 mb-1">
              Beer Name *
            </label>
            <input
              type="text"
              id="beerName"
              name="beerName"
              value={formData.beerName}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              placeholder="e.g., Pilsner Urquell"
            />
          </div>

          {/* Alcohol Percentage */}
          <div>
            <label htmlFor="alcoholPercentage" className="block text-sm font-medium text-gray-700 mb-1">
              Alcohol by Volume (ABV %) *
            </label>
            <input
              type="number"
              id="alcoholPercentage"
              name="alcoholPercentage"
              value={formData.alcoholPercentage}
              onChange={handleChange}
              disabled={isSubmitting}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              placeholder="e.g., 4.4"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the alcohol percentage (e.g., 4.4 for 4.4% ABV)
            </p>
          </div>

          {/* Excise Duty Calculation Display */}
          {exciseDuty !== null && exciseDuty > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-4 border-green-500 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 rounded-full p-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Irish Excise Duty</p>
                    <p className="text-4xl font-black text-green-700">
                      €{exciseDuty.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Based on:</p>
                  <p className="text-sm font-semibold text-gray-700">{parseFloat(formData.quantity || '0').toFixed(1)} L @ {parseFloat(formData.alcoholPercentage || '0').toFixed(1)}% ABV</p>
                  <p className="text-xs text-green-600 mt-1">
                    Rate: €{parseFloat(formData.alcoholPercentage || '0') <= 2.8 ? '11.27' : '22.55'}/hl
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t-2 border-green-200">
                <p className="text-xs text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Automatically calculated per Irish Revenue regulations
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quantity and Unit - Hide when Beer is selected (calculator handles it) */}
      {formData.goodsType !== 'Beer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              onBlur={() => handleBlur('quantity')}
              disabled={isSubmitting}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] ${
                touched.quantity && errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {touched.quantity && errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
            )}
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit *
            </label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              onBlur={() => handleBlur('unit')}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] ${
                touched.unit && errors.unit ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select unit</option>
              {UNITS.map(unit => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            {touched.unit && errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
            )}
          </div>
        </div>
      )}

      {/* Origin */}
      <div>
        <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
          Origin *{' '}
          <span className="text-xs text-purple-600">(Auto-populated from Consignor Identity)</span>
        </label>
        <input
          type="text"
          id="origin"
          name="origin"
          value={formData.origin}
          onChange={handleChange}
          onBlur={() => handleBlur('origin')}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px] bg-purple-50 ${
            touched.origin && errors.origin ? 'border-red-500' : 'border-purple-300'
          }`}
          placeholder="Auto-filled from IOTA Identity"
        />
        {touched.origin && errors.origin && (
          <p className="mt-1 text-sm text-red-600">{errors.origin}</p>
        )}
      </div>

      {/* Destination */}
      <div>
        <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
          Destination *{' '}
          <span className="text-xs text-purple-600">(Auto-populated from Consignee Identity)</span>
        </label>
        <input
          type="text"
          id="destination"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          onBlur={() => handleBlur('destination')}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px] bg-purple-50 ${
            touched.destination && errors.destination ? 'border-red-500' : 'border-purple-300'
          }`}
          placeholder="Auto-filled from IOTA Identity"
        />
        {touched.destination && errors.destination && (
          <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
        )}
      </div>

      {/* Transport Details Section */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Transport Details (Optional)</h3>

        {/* Transport Modes - Multiple Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transport Modes (select one or more)
          </label>
          <div className="space-y-2">
            {TRANSPORT_MODES.map(mode => (
              <label key={mode} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.transportModes.includes(mode)}
                  onChange={() => handleTransportModeChange(mode)}
                  disabled={isSubmitting}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{mode}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Vehicle License Plate */}
        <div className="mb-4">
          <label
            htmlFor="vehicleLicensePlate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Vehicle License Plate
          </label>
          <input
            type="text"
            id="vehicleLicensePlate"
            name="vehicleLicensePlate"
            value={formData.vehicleLicensePlate}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            placeholder="e.g., ABC-1234"
          />
        </div>

        {/* Container Number */}
        <div>
          <label htmlFor="containerNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Container Number
          </label>
          <input
            type="text"
            id="containerNumber"
            name="containerNumber"
            value={formData.containerNumber}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            placeholder="e.g., CONT123456"
          />
        </div>
      </div>

      {/* Wallet Connection Warning */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            Please connect your wallet to create a consignment.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className={`px-6 py-2 rounded-md font-medium transition-colors min-h-[44px] w-full sm:w-auto ${
            !isFormValid() || isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <LoadingSpinner size="sm" color="white" className="mr-2" />
              Creating...
            </span>
          ) : (
            'Create Consignment'
          )}
        </button>
      </div>
    </form>
  );
}
