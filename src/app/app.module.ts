import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RestaurantMenuComponent } from './components/restaurant-menu/restaurant-menu.component';
import { FormsModule } from '@angular/forms';
import { MandiTownComponent } from './components/mandi-town/mandi-town.component';
import { RestaurantQrComponent } from './restaurant-qr/restaurant-qr.component';
@NgModule({
  declarations: [
    AppComponent,
    RestaurantMenuComponent,
     MandiTownComponent,
     RestaurantQrComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,     
    HttpClientModule,
  FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
