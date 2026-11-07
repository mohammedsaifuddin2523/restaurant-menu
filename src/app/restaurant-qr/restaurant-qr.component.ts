
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as QRCode from 'qrcode';

interface RestaurantRegistry {
  restaurants: {
    slug: string;
    configPath: string;
  }[];
}

interface RestaurantQr {
  slug: string;
  restaurantName: string;
  tagline?: string;
  logo?: string;
  menuUrl: string;
  qrCode: string;
}

@Component({
  selector: 'app-restaurant-qr',
  templateUrl: './restaurant-qr.component.html',
  styleUrls: ['./restaurant-qr.component.scss']
})
export class RestaurantQrComponent implements OnInit {

  restaurants: RestaurantQr[] = [];
  loading = false;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  async ngOnInit(): Promise<void> {
    await this.loadRestaurants();
  }

  async loadRestaurants(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const baseUrl = document.baseURI;

      const registryUrl = new URL(
        'assets/restaurants/restaurant-registry.json',
        baseUrl
      ).toString();

      const registry = await this.http
        .get<RestaurantRegistry>(registryUrl)
        .toPromise();

      if (!registry || !registry.restaurants) {
        throw new Error('Invalid restaurant registry.');
      }

      const restaurantResults = await Promise.all(
        registry.restaurants.map(async (restaurant) => {

          try {
            const configUrl = new URL(
              restaurant.configPath,
              baseUrl
            ).toString();

            const menu: any = await this.http
              .get(configUrl)
              .toPromise();

            // Permanent restaurant URL.
            const menuUrl =
              window.location.origin +
              window.location.pathname +
              `#/menu/${encodeURIComponent(restaurant.slug)}`;

            console.log('Restaurant Name:', menu.restaurantName);
            console.log('Restaurant Slug:', restaurant.slug);
            console.log('Configuration URL:', configUrl);
            console.log('Generated Menu URL:', menuUrl);

            // Get restaurant logo URL.
            const logoUrl = menu.logo
              ? new URL(menu.logo, baseUrl).toString()
              : '';

            // Generate QR code with restaurant logo.
            const qrCode = await this.generateQrWithLogo(
              menuUrl,
              logoUrl
            );

            console.log(
              'QR Generated Successfully:',
              restaurant.slug,
              !!qrCode
            );

            return {
              slug: restaurant.slug,
              restaurantName:
                menu.restaurantName || restaurant.slug,
              tagline: menu.tagline || '',
              logo: logoUrl,
              menuUrl: menuUrl,
              qrCode: qrCode
            } as RestaurantQr;

          } catch (error) {
            console.error(
              `Unable to load restaurant: ${restaurant.slug}`,
              error
            );

            return null;
          }
        })
      );

      this.restaurants = restaurantResults.filter(
        (item): item is RestaurantQr => item !== null
      );

      if (this.restaurants.length === 0) {
        this.errorMessage = 'No restaurant menus could be loaded.';
      }

    } catch (error) {
      console.error('Restaurant registry loading failed:', error);
      this.errorMessage = 'Unable to load restaurant registry.';
    } finally {
      this.loading = false;
    }
  }

  // Generate QR code and embed restaurant logo.
  private async generateQrWithLogo(
    menuUrl: string,
    logoUrl: string
  ): Promise<string> {

    const canvas = document.createElement('canvas');

    await QRCode.toCanvas(canvas, menuUrl, {
      width: 400,
      margin: 3,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Return normal QR if logo is unavailable.
    if (!logoUrl) {
      return canvas.toDataURL('image/png');
    }

    try {
      const logo = new Image();

      // Supports cross-origin logo loading where the server allows it.
      logo.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        logo.onload = () => resolve();
        logo.onerror = () => reject(
          new Error('Restaurant logo could not be loaded.')
        );

        logo.src = logoUrl;
      });

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return canvas.toDataURL('image/png');
      }

      // Logo dimensions.
      const logoSize = 64;

      const centerX = (canvas.width - logoSize) / 2;
      const centerY = (canvas.height - logoSize) / 2;

      // White background around logo.
      const padding = 9;

      ctx.fillStyle = '#FFFFFF';

      ctx.fillRect(
        centerX - padding,
        centerY - padding,
        logoSize + (padding * 2),
        logoSize + (padding * 2)
      );

      // Draw restaurant logo in QR center.
      ctx.drawImage(
        logo,
        centerX,
        centerY,
        logoSize,
        logoSize
      );

      return canvas.toDataURL('image/png');

    } catch (error) {
      console.error(
        'Restaurant logo insertion failed:',
        logoUrl,
        error
      );

      // Fallback: return QR without logo.
      return canvas.toDataURL('image/png');
    }
  }



  // Preview restaurant menu.
  openMenu(restaurant: RestaurantQr): void {
    window.open(restaurant.menuUrl, '_blank');
  }

// Download QR code - Plain or Branded.
async downloadQr(
  restaurant: RestaurantQr,
  type: 'plain' | 'branded' | 'center-logo'
): Promise<void> {

  try {

    const qrCanvas = document.createElement('canvas');

    await QRCode.toCanvas(qrCanvas, restaurant.menuUrl, {
      width: 440,
      margin: 3,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // OPTION 1: QR Only
    if (type === 'plain') {

      this.downloadCanvas(
        qrCanvas,
        `${restaurant.slug}-QR.png`
      );

      return;
    }

    // OPTION 2: QR With Center Logo
    if (type === 'center-logo') {

      if (restaurant.logo) {

        try {

          const logo = await this.loadRestaurantLogo(
            restaurant.logo
          );

          const ctx = qrCanvas.getContext('2d');

          if (ctx) {

            const logoSize = 85;
            const padding = 12;

            const centerX = (qrCanvas.width - logoSize) / 2;
            const centerY = (qrCanvas.height - logoSize) / 2;

            // White background around center logo.
            ctx.fillStyle = '#FFFFFF';

            ctx.fillRect(
              centerX - padding,
              centerY - padding,
              logoSize + padding * 2,
              logoSize + padding * 2
            );

            // Draw restaurant logo.
            ctx.drawImage(
              logo,
              centerX,
              centerY,
              logoSize,
              logoSize
            );
          }

        } catch (error) {

          console.error('Center logo loading failed:', error);

        }
      }

      this.downloadCanvas(
        qrCanvas,
        `${restaurant.slug}-QR-Center-Logo.png`
      );

      return;
    }

    // OPTION 3: Branded QR
    const outputCanvas = document.createElement('canvas');

    outputCanvas.width = 600;
    outputCanvas.height = 810;

    const ctx = outputCanvas.getContext('2d');

    if (!ctx) {
      throw new Error('Unable to create canvas.');
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 810);

    // Restaurant logo at top.
    if (restaurant.logo) {

      try {

        const logo = await this.loadRestaurantLogo(
          restaurant.logo
        );

        const maxWidth = 150;
        const maxHeight = 110;

        const scale = Math.min(
          maxWidth / logo.width,
          maxHeight / logo.height
        );

        const logoWidth = logo.width * scale;
        const logoHeight = logo.height * scale;

        ctx.drawImage(
          logo,
          (600 - logoWidth) / 2,
          25 + (maxHeight - logoHeight) / 2,
          logoWidth,
          logoHeight
        );

      } catch (error) {

        console.error('Restaurant logo loading failed:', error);

      }
    }

    // Restaurant name.
    ctx.fillStyle = '#222222';
    ctx.textAlign = 'center';
    ctx.font = 'bold 32px Arial';

    ctx.fillText(
      restaurant.restaurantName,
      300,
      180,
      550
    );

    // Tagline.
    ctx.fillStyle = '#666666';
    ctx.font = '18px Arial';

    ctx.fillText(
      restaurant.tagline || '',
      300,
      220,
      550
    );

    // QR code.
    ctx.drawImage(
      qrCanvas,
      80,
      260,
      440,
      440
    );

    // Footer.
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px Arial';

    ctx.fillText(
      'SCAN TO VIEW MENU',
      300,
      750
    );

    this.downloadCanvas(
      outputCanvas,
      `${restaurant.slug}-Branded-QR.png`
    );

  } catch (error) {

    console.error('QR download failed:', error);

    this.errorMessage = 'Unable to download QR code.';

  }
}

// Common download method.
private downloadCanvas(
  canvas: HTMLCanvasElement,
  fileName: string
): void {

  const link = document.createElement('a');

  link.href = canvas.toDataURL('image/png');
  link.download = fileName;

  link.click();
}
// Load restaurant logo.
private loadRestaurantLogo(
  logoUrl: string
): Promise<HTMLImageElement> {

  return new Promise((resolve, reject) => {

    const image = new Image();

    image.crossOrigin = 'anonymous';

    image.onload = () => resolve(image);

    image.onerror = () => reject(
      new Error('Unable to load restaurant logo.')
    );

    image.src = logoUrl;

  });
}




}
