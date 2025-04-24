export interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  client_id: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  assigned_company_id: number;
  created_at: string;
  updated_at: string;
  company: Company;
}

export interface Product {
  id: number;
  thumbnail: string;
  id_mlc: string;
  title: string;
  price_clp: string;
  warehouse_stock: number;
  warehouse_id: number;
  created_at: string;
  updated_at: string;
}

export interface DropdownFilterProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export interface Connection {
  client_id: string;
  client_secret: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  nickname: string;
  email: string;
  profile_image: string;
  created_at: string;
  updated_at: string;
}
