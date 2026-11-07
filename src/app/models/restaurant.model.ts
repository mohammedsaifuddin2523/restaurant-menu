export interface Restaurant {
  id: string;
  restaurantName: string;
  tagline?: string;
  logo: string;
  address: string;
  phone: string;
  categories: MenuCategory[];
}

export interface MenuCategory {
  id: number;
  categoryName: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
}