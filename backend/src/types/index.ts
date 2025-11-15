// Consignment types
export interface Consignment {
  arc: string;
  consignor: string;
  consignee: string;
  goodsType: string;
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
  status: ConsignmentStatus;
  documentHash?: string;
  createdAt: string;
  dispatchedAt?: string;
  receivedAt?: string;
  transactionId?: string;
  // Transport details - multiple modes supported (Road, Rail, Sea)
  transportModes?: string[];
  vehicleLicensePlate?: string;
  containerNumber?: string;
  // Beer-specific fields
  beerName?: string;
  alcoholPercentage?: number; // ABV (e.g., 4.4, 4.5, 2.5)
  exciseDutyAmount?: number; // Calculated Irish excise duty in euros
  // SEED operator info
  consignorInfo?: {
    seedNumber: string;
    companyName: string;
    vatNumber: string;
    country: string;
    address: string;
  };
  consigneeInfo?: {
    seedNumber: string;
    companyName: string;
    vatNumber: string;
    country: string;
    address: string;
  };
  beerPackaging?: {
    canSize: number;
    cansPerPackage: number;
    numberOfPackages: number;
    totalCans: number;
    totalLiters: number;
  };
}

export enum ConsignmentStatus {
  DRAFT = 'Draft',
  IN_TRANSIT = 'In Transit',
  RECEIVED = 'Received',
}

export interface BeerPackagingData {
  canSize: number; // in ml
  cansPerPackage: number;
  numberOfPackages: number;
  totalCans: number;
  totalLiters: number;
}

export interface CreateConsignmentRequest {
  consignor: string;
  consignee: string;
  goodsType: string;
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
  transportModes?: string[];
  vehicleLicensePlate?: string;
  containerNumber?: string;
  beerName?: string;
  alcoholPercentage?: number;
  exciseDutyAmount?: number;
  beerPackaging?: BeerPackagingData;
}

export interface DispatchConsignmentRequest {
  consignor: string;
}

export interface ReceiveConsignmentRequest {
  consignee: string;
}

// Movement event types
export interface MovementEvent {
  type: EventType;
  timestamp: string;
  actor: string;
  transactionId: string;
  documentHash?: string;
}

export enum EventType {
  CREATED = 'Created',
  DISPATCHED = 'Dispatched',
  RECEIVED = 'Received',
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface CreateConsignmentResponse {
  arc: string;
  transactionId: string;
  consignmentId: string;
}

export interface DispatchConsignmentResponse {
  transactionId: string;
  documentHash: string;
  dispatchedAt: string;
}

export interface ReceiveConsignmentResponse {
  transactionId: string;
  receivedAt: string;
}
