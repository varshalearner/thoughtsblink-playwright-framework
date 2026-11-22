import { test as base } from '@playwright/test';
import { ArtistsPage } from '@pages/artists.page';
import { HomePage } from '@pages/home.page';
import { ShopPage } from '@pages/shop.page';

export interface PageFixtures {
  homePage: HomePage;
  shopPage: ShopPage;
  artistsPage: ArtistsPage;
}

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  shopPage: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
  artistsPage: async ({ page }, use) => {
    await use(new ArtistsPage(page));
  },
});
