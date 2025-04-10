export interface Product {
  id: string;
  thumbnail: string;
  site_id: string;
  title: string;
  seller_id: number;
  category_id: string;
  user_product_id: string;
  price: number;
  base_price: number;
  available_quantity: number;
  permalink: string;
  status: string;
  status_translated: string;
}

export interface ProductModalProps {
  show: boolean;
  onHide: () => void;
  product: Product | null;
  modalContent: "main" | "stock" | "pause";
  onUpdateStock: (productId: string, newStock: number, pause?: boolean) => Promise<void>;
  onUpdateStatus: (productId: string, newStatus: string) => Promise<void>;
  onStockChange: (productId: string, newStock: number) => void;
  stockEdit: { [key: string]: number };
  fetchProducts: () => void;
  setModalContent: React.Dispatch<React.SetStateAction<"main" | "stock" | "pause">>;
}

export interface ProductTableProps {
  categorizedProducts: { [key: string]: Product[] };
  categories: { [key: string]: string };
  isEditing: { [key: string]: boolean };
  stockEdit: { [key: string]: number };
  onStockChange: (productId: string, newStock: number) => void;
  formatPriceCLP: (price: number) => string;
  onUpdateStatus: (productId: string, newStatus: string) => Promise<void>;
  onUpdateStock?: (productId: string, value: number) => Promise<void>;
  onOpenModal?: () => void;
  onSelectProduct?: (product: Product) => void;
  onEditProduct?: (updatedProduct: Product) => void;
}
export interface ProductActionsDropdownProps {
  productId: string;
  onEdit?: (id: string) => void;
  onUpdateStatus?: (id: string, status: string) => void;
}