import { faker } from '@faker-js/faker';
import { z } from 'zod';
import { test as base, expect } from '@fixtures';
import { pngFile, textFile } from '@data/files';
import { TEST_DATA_PREFIX } from '@data/listing.factory';
import { authFile } from '@utils/auth-state';

const savedSchema = z.array(z.object({ id: z.uuid(), images: z.array(z.string()) }));

const test = base.extend<{ listingTitle: string }>({
  /**
   * A unique title for a listing the test creates through the UI. Teardown finds it by title,
   * deletes its uploaded images from Storage and then the listing itself.
   */
  listingTitle: async ({ artistApi }, use) => {
    const title = `[${TEST_DATA_PREFIX}] ${faker.word.adjective()} upload ${faker.string.alphanumeric(8)}`;
    await use(title);
    const found = await artistApi.listings.find({ select: 'id,images', title: `eq.${title}` });
    for (const listing of savedSchema.parse(await found.json())) {
      for (const image of listing.images) {
        const removed = await artistApi.storage.removeArtworkImage(image);
        if (!removed.ok()) throw new Error(`Uploaded image not deleted: ${await removed.text()}`);
      }
      const removed = await artistApi.listings.remove(listing.id);
      if (!removed.ok()) throw new Error(`Uploaded listing not deleted: ${await removed.text()}`);
    }
  },
});

test.use({ storageState: authFile('artist') });

test.describe('Upload artwork', () => {
  test(
    'an artist uploads an image and saves the artwork as a draft',
    { tag: '@regression' },
    async ({ page, newListingPage, artistApi, listingTitle }) => {
      await newListingPage.open();

      await newListingPage.addImages(pngFile());
      await expect(newListingPage.newImagePreviews).toHaveCount(1);
      await newListingPage.describe({ title: listingTitle, description: faker.lorem.sentence() });
      await newListingPage.saveAsDraft();

      await expect(page.getByText('Saved as draft.')).toBeVisible();
      const saved = await artistApi.listings.find({
        select: 'id,images',
        title: `eq.${listingTitle}`,
      });
      const [listing] = z.tuple([savedSchema.element]).parse(await saved.json());
      expect(listing.images).toEqual([
        expect.stringContaining('/storage/v1/object/public/artworks/'),
      ]);
    },
  );

  test(
    'files that are not images are ignored',
    { tag: '@regression' },
    async ({ newListingPage }) => {
      await newListingPage.open();

      await newListingPage.addImages(textFile(), pngFile());

      await expect(newListingPage.newImagePreviews).toHaveCount(1);
    },
  );
});
