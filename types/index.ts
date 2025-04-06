export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  compare_at_price?: number
  cost_price?: number
  sku?: string
  barcode?: string
  inventory_quantity: number
  category_id?: string
  brand?: string
  is_active?: boolean
  is_featured?: boolean
  created_at?: string
  updated_at?: string
  category?: Category
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text?: string
  position?: number
  variant_id?: string
  created_at?: string
}

export interface ProductVariant {
  id: string
  product_id: string
  sku?: string
  barcode?: string
  price?: number
  compare_at_price?: number
  inventory_quantity: number
  size?: string
  color?: string
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  created_at?: string
  updated_at?: string
}

export interface Order {
  id: string
  order_number: string
  user_id?: string
  email: string
  status: string
  payment_status: string
  payment_method?: string
  subtotal: number
  tax: number
  shipping_cost: number
  discount: number
  total: number
  currency: string
  shipping_address_id?: string
  billing_address_id?: string
  notes?: string
  created_at?: string
  updated_at?: string
  items?: OrderItem[]
  user?: User
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id?: string
  name: string
  sku?: string
  price: number
  quantity: number
  subtotal: number
  created_at?: string
}

export interface Address {
  id: string
  user_id: string
  type: string
  first_name: string
  last_name: string
  company?: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
  is_default?: boolean
  created_at?: string
  updated_at?: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  title?: string
  content?: string
  is_published?: boolean
  is_verified?: boolean
  created_at?: string
  updated_at?: string
  user?: User
}

export interface Wishlist {
  created_at: string
  id: string
  product: Product
  product_id: string
  user_id: string
}


