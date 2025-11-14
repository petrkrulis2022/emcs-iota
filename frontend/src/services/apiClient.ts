import axios, { AxiosInstance, AxiosError } from 'axios';
import { Consignment } from '../stores/useConsignmentStore';

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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

export interface CreateConsignmentResponse {
  success: boolean;
  arc: string;
  transactionId: string;
  consignmentId: string;
}

export interface ConsignmentsResponse {
  consignments: Consignment[];
}

export interface DispatchConsignmentRequest {
  consignor: string;
}

export interface DispatchConsignmentResponse {
  success: boolean;
  transactionId: string;
  documentHash: string;
  dispatchedAt: string;
}

export interface ReceiveConsignmentRequest {
  consignee: string;
}

export interface ReceiveConsignmentResponse {
  success: boolean;
  transactionId: string;
  receivedAt: string;
}

export interface MovementEvent {
  type: 'Created' | 'Dispatched' | 'Received';
  timestamp: string;
  actor: string;
  transactionId: string;
  documentHash?: string;
}

export interface EventsResponse {
  events: MovementEvent[];
}

class APIClient {
  private client: AxiosInstance;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      config => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const config = error.config;

        // Retry logic for network timeouts
        if (config && error.code === 'ECONNABORTED' && (!config as any).retryCount) {
          (config as any).retryCount = (config as any).retryCount || 0;

          if ((config as any).retryCount < this.maxRetries) {
            (config as any).retryCount += 1;

            // Wait before retrying
            await new Promise(resolve =>
              setTimeout(resolve, this.retryDelay * (config as any).retryCount)
            );

            console.log(`Retrying request (${(config as any).retryCount}/${this.maxRetries})...`);
            return this.client(config);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error status
      const message = (error.response.data as any)?.error || error.message;
      return new Error(`API Error: ${message}`);
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error: Unable to reach the server');
    } else {
      // Something else happened
      return new Error(`Request error: ${error.message}`);
    }
  }

  /**
   * Create a new consignment
   */
  async createConsignment(data: CreateConsignmentRequest): Promise<CreateConsignmentResponse> {
    const response = await this.client.post<CreateConsignmentResponse>('/api/consignments', data);
    return response.data;
  }

  /**
   * Get all consignments for an operator
   */
  async getConsignments(operator: string, status?: string): Promise<ConsignmentsResponse> {
    const params: any = { operator };
    if (status) {
      params.status = status;
    }

    const response = await this.client.get<ConsignmentsResponse>('/api/consignments', { params });
    return response.data;
  }

  /**
   * Get a single consignment by ARC
   */
  async getConsignment(arc: string): Promise<Consignment> {
    const response = await this.client.get<Consignment>(`/api/consignments/${arc}`);
    return response.data;
  }

  /**
   * Dispatch a consignment (change status to In Transit)
   */
  async dispatchConsignment(arc: string, consignor: string): Promise<DispatchConsignmentResponse> {
    const response = await this.client.post<DispatchConsignmentResponse>(
      `/api/consignments/${arc}/dispatch`,
      { consignor }
    );
    return response.data;
  }

  /**
   * Confirm receipt of a consignment
   */
  async receiveConsignment(arc: string, consignee: string): Promise<ReceiveConsignmentResponse> {
    const response = await this.client.post<ReceiveConsignmentResponse>(
      `/api/consignments/${arc}/receive`,
      { consignee }
    );
    return response.data;
  }

  /**
   * Get movement history for a consignment
   */
  async getConsignmentEvents(arc: string): Promise<EventsResponse> {
    const response = await this.client.get<EventsResponse>(`/api/consignments/${arc}/events`);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new APIClient();
