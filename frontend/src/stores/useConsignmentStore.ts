import { create } from 'zustand';

export interface Consignment {
  arc: string;
  consignor: string;
  consignee: string;
  goodsType: string;
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
  status: 'Draft' | 'In Transit' | 'Received';
  documentHash?: string;
  createdAt: string;
  dispatchedAt?: string;
  receivedAt?: string;
}

interface ConsignmentState {
  consignments: Consignment[];
  loading: boolean;
  setConsignments: (consignments: Consignment[]) => void;
  setLoading: (loading: boolean) => void;
  fetchConsignments: (operator: string, status?: string) => Promise<void>;
}

export const useConsignmentStore = create<ConsignmentState>(set => ({
  consignments: [],
  loading: false,
  setConsignments: consignments => set({ consignments }),
  setLoading: loading => set({ loading }),
  fetchConsignments: async (operator: string, status?: string) => {
    set({ loading: true });
    try {
      const { apiClient } = await import('../services/apiClient');
      const response = await apiClient.getConsignments(operator, status);
      set({ consignments: response.consignments || [], loading: false });
    } catch (error) {
      console.error('Failed to fetch consignments:', error);
      set({ consignments: [], loading: false });
    }
  },
}));
