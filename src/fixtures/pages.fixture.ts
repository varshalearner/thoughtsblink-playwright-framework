import { test as base, type Page } from '@playwright/test';
import { ReviewQueuePage } from '@pages/admin/review-queue.page';
import { ArtistsPage } from '@pages/artists.page';
import { ArtworkPage } from '@pages/artwork.page';
import { ChatPage } from '@pages/chat.page';
import { HomePage } from '@pages/home.page';
import { LoginPage } from '@pages/login.page';
import { NewListingPage } from '@pages/sell/new-listing.page';
import { ShopPage } from '@pages/shop.page';

export interface PageFixtures {
  homePage: HomePage;
  shopPage: ShopPage;
  artistsPage: ArtistsPage;
  artworkPage: ArtworkPage;
  reviewQueuePage: ReviewQueuePage;
  loginPage: LoginPage;
  chatPage: ChatPage;
  newListingPage: NewListingPage;
}

/** Every page object bound to one page, for pages the fixtures below do not own. */
export function pagesFor(page: Page): PageFixtures & { page: Page } {
  return {
    page,
    homePage: new HomePage(page),
    shopPage: new ShopPage(page),
    artistsPage: new ArtistsPage(page),
    artworkPage: new ArtworkPage(page),
    reviewQueuePage: new ReviewQueuePage(page),
    loginPage: new LoginPage(page),
    chatPage: new ChatPage(page),
    newListingPage: new NewListingPage(page),
  };
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
  artworkPage: async ({ page }, use) => {
    await use(new ArtworkPage(page));
  },
  reviewQueuePage: async ({ page }, use) => {
    await use(new ReviewQueuePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  chatPage: async ({ page }, use) => {
    await use(new ChatPage(page));
  },
  newListingPage: async ({ page }, use) => {
    await use(new NewListingPage(page));
  },
});
