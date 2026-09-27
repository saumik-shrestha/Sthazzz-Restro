import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  headers: { "Content-Type": "application/json" },
});
export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
};
export type MenuItem = {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  dietary_tags: string[];
  spicy_level: number;
  is_available: boolean;
};
export type CartItem = MenuItem & { quantity: number };
export const npr = (v: number) => `Rs. ${v.toLocaleString("en-NP")}`;
