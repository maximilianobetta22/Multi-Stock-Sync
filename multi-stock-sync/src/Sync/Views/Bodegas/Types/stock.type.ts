export interface StockWarehouse {
  id: number;
  id_mlc: string;
  warehouse_id: number;
  title: string;
  price: number;
  available_quantity: number;
  condicion: string;
  currency_id: string;
  category_id: string;
  attribute: Array<{ id: string; value_name: string }>; // e.g., color, size
  pictures: Array<{ src: string }>;
  shipping: Array<{ mode: string; free_shipping: boolean }>;
  description: string;
  listing_type_id: string;
  created_at: string;
  updated_at: string;
}