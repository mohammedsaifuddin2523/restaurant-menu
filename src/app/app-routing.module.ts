import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RestaurantMenuComponent } from './components/restaurant-menu/restaurant-menu.component';
import { MandiTownComponent } from './components/mandi-town/mandi-town.component';
import { RestaurantQrComponent } from './restaurant-qr/restaurant-qr.component';

const routes: Routes = [

  // Default page - Admin QR Generator
  {
    path: '',
    redirectTo: 'restaurant-qr',
    pathMatch: 'full'
  },

  // Admin QR Generator
  {
    path: 'restaurant-qr',
    component: RestaurantQrComponent
  },

  // Mandi Town Hyderabad
  {
    path: 'menu/manditown',
    component: MandiTownComponent
  },

  // Pista House and future restaurants
  {
    path: 'menu/:id',
    component: RestaurantMenuComponent
  },

  // Invalid URLs redirect to Admin QR Generator
  {
    path: '**',
    redirectTo: 'restaurant-qr'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }