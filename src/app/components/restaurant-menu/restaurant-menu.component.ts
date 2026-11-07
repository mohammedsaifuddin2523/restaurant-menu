
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { Restaurant, MenuCategory, MenuItem } from '../../models/restaurant.model';

@Component({
  selector: 'app-restaurant-menu',
  templateUrl: './restaurant-menu.component.html',
  styleUrls: ['./restaurant-menu.component.scss']
})
export class RestaurantMenuComponent implements OnInit {

  restaurant: Restaurant | null = null;
  searchText = '';
  selectedCategory = 'All';
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private menuService: MenuService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        this.loadRestaurant(id);
      }
    });
  }

  loadRestaurant(id: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.menuService.getRestaurantMenu(id).subscribe(
      data => {
        this.restaurant = data;
        this.loading = false;
      },
      error => {
        console.error(error);
        this.errorMessage = 'Unable to load menu. Please try again.';
        this.loading = false;
      }
    );
  }

  get filteredCategories(): MenuCategory[] {
    if (!this.restaurant) {
      return [];
    }

    return this.restaurant.categories
      .filter(category =>
        this.selectedCategory === 'All' ||
        category.categoryName === this.selectedCategory
      )
      .map(category => ({
        ...category,
        items: category.items.filter(item =>
          item.isAvailable &&
          (
            item.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
            item.description.toLowerCase().includes(this.searchText.toLowerCase())
          )
        )
      }))
      .filter(category => category.items.length > 0);
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  getCategoryImage(category: string): string {
    const images: { [key: string]: string } = {
      'Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
      'Sandwiches': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop',
      'Wraps': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop',
      'Rolls': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop',
      'Pizzas': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop',
      'Salads': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop',
      'Mocktails': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&fit=crop'
    };

    return images[category] ||
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=600';
  }

  getItemImage(item: MenuItem, category: string): string {
    return item.image || this.getCategoryImage(category);
  }

  get totalItems(): number {
    return this.restaurant
      ? this.restaurant.categories.reduce(
          (total, category) => total + category.items.length, 0
        )
      : 0;
  }

}
