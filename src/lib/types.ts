export type Role = "customer" | "admin";

export type OrderStatus = "placed" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  uom: string;
  image_url: string | null;
  category_id: string | null;
  category_name?: string | null;
  tag: string | null;
  is_active: boolean;
  avg_rating: number;
  review_count: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  author_name?: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address1: string | null;
  address2: string | null;
  country: string | null;
  state: string | null;
  postal_code: string | null;
  date_of_birth: string | null;
  role: Role;
  is_disabled: boolean;
}

export interface CartLine {
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface OrderItem {
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  shipping_address: Record<string, unknown> | null;
  created_at: string;
  items?: OrderItem[];
}
