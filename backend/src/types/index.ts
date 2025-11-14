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
}

export enum ConsignmentStatus {
  DRAFT = 'Draft',
  IN_TRANSIT = 'In Transit',
  RECEIVED = 'Received',
}

export interface CreateConsignmentRequest {
  consignor: string;
  consignee: string;
  goodsType: string;
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
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
