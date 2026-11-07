
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Restaurant } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private menuBasePath = 'assets/menus/';

  constructor(private http: HttpClient) { }

  getRestaurantMenu(id: string): Observable<Restaurant> {

    const menuUrl = `${this.menuBasePath}${id}.json`;

    return this.http.get<Restaurant>(menuUrl);
  }
}
