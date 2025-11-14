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
  transportMode?: string;
  vehicleLicensePlate?: string;
  containerNumber?: string;
  beerPackaging?: BeerPackagingData;
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
const TRANSPORT_MODES = ['Road', 'Rail', 'Sea', 'Air'];

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
    transportMode: '',
    vehicleLicensePlate: '',
    containerNumber: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [beerPackagingData, setBeerPackagingData] = useState<BeerPackagingData | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // If goods type changes to Beer, set unit to Liters
    if (name === 'goodsType' && value === 'Beer') {
      setFormData(prev => ({ ...prev, unit: 'Liters' }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
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

    await onSubmit(formData);
  };

  const isFormValid = () => {
    return (
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
        <BeerPackagingCalculator onChange={handleBeerPackagingChange} />
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

        {/* Transport Mode */}
        <div className="mb-4">
          <label htmlFor="transportMode" className="block text-sm font-medium text-gray-700 mb-1">
            Transport Mode
          </label>
          <select
            id="transportMode"
            name="transportMode"
            value={formData.transportMode}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          >
            <option value="">Select transport mode</option>
            {TRANSPORT_MODES.map(mode => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
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
