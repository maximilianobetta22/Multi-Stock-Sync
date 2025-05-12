export interface Product {
    id: string;
    title: string;
    category_id: string;
    price: number;
    currency_id: string;
    available_quantity: number;
    condition: string;
    listing_type_id: string;
    description: string;
    pictures: { source: string }[];
    attributes: { id: string; value_name: string }[];
    shipping: {
      mode: string;
      local_pick_up: boolean;
      free_shipping: boolean;
    };
    sale_terms?: {
      id: string;
      value_name: string;
    }[];
  }
  
  export interface ProductModalProps {
    open: boolean;
    onClose: () => void;
    product?: Product;
  }
  
  export interface ProductActionsDropdownProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
  }
  
  export interface ProductTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
  }
  