export interface Company {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
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
