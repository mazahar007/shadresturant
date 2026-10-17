export interface Product {
  id: number;
  name: string;
  cat: string;
  price: number;
  buy: number;
  stock: number;
  emoji: string;
  barcode: string | null;
  expiry: string | null;
  created_at?: string;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number | null;
  name: string;
  qty: number;
  price: number;
}

export interface Sale {
  id: number;
  date: string;
  time: string;
  token: string;
  customer: string;
  total: number;
  paid: number;
  due: number;
  method: string;
  table_no: string;
  items: SaleItem[];
  created_at?: string;
}

export interface Expense {
  id: number;
  date: string;
  cat: string;
  amount: number;
  note: string | null;
  created_at?: string;
}
