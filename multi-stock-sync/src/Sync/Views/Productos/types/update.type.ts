import { Connection } from "./connection.type";

export interface UpdateStockParams {
  productId: string;
  newStock: number;
  pause: boolean;
  accessToken: string;
}

export interface UpdateStatusParams {
  productId: string;
  newStatus: string;
  accessToken: string;
}

export interface UseUpdateManagementProps {
  connections: Connection[];
  selectedConnection: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}
