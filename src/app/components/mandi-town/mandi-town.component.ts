
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface MandiMenuItem {
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
}

interface MandiMenuCategory {
  categoryName: string;
  items: MandiMenuItem[];
}

interface MandiMenuConfig {
  restaurantName: string;
  tagline: string;
  logo: string;
  categories: MandiMenuCategory[];
}

@Component({
  selector: 'app-mandi-town',
  templateUrl: './mandi-town.component.html',
  styleUrls: ['./mandi-town.component.scss']
})
export class MandiTownComponent implements OnInit {

  restaurantName = 'Mandi Town Hyderabad';

  tagline = 'Authentic Arabian Mandi Experience';

  logo = 'assets/restaurants/manditown/mandiRestaurant.png';

  searchText = '';

  selectedCategory = 'All';

  loading = true;

  errorMessage = '';

  categories: MandiMenuCategory[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadMenu();
  }

  // Load restaurant menu from JSON
  loadMenu(): void {

    this.loading = true;
    this.errorMessage = '';

    this.http.get<MandiMenuConfig>(
      'assets/restaurants/manditown/menu.json'
    ).subscribe({

      next: (data) => {

        this.restaurantName = data.restaurantName;
        this.tagline = data.tagline;
        this.logo = data.logo;

        // IMPORTANT: Load individual images from each menu item.
        // Do not use category.image because images are defined in item.image.

        this.categories = data.categories.map(category => ({
          ...category,
          items: category.items.map(item => ({
            ...item,
            image: item.image
          }))
        }));

        console.log('Mandi Town Menu Loaded:', this.categories);

        this.loading = false;
      },

      error: (error) => {

        console.error('Mandi Town menu loading failed:', error);

        this.errorMessage =
          'Unable to load menu. Please try again.';

        this.loading = false;
      }

    });
  }

  // Filter categories and menu items
  get filteredCategories(): MandiMenuCategory[] {

    const search = this.searchText.trim().toLowerCase();

    return this.categories
      .filter(category =>
        this.selectedCategory === 'All' ||
        category.categoryName === this.selectedCategory
      )
      .map(category => ({
        ...category,
        items: category.items.filter(item =>
          item.isAvailable &&
          (
            item.name.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search)
          )
        )
      }))
      .filter(category => category.items.length > 0);
  }

  // Select menu category
  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  // Total menu items
  get totalItems(): number {
    return this.categories.reduce(
      (total, category) => total + category.items.length,
      0
    );
  }

  // Handle image loading errors
  onImageError(event: Event): void {

    const img = event.target as HTMLImageElement;

    console.error('Failed to load menu image:', img.src);

  }

}
