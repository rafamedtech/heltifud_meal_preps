import { defineCollection, defineContentConfig, z } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    menu: defineCollection({
      type: 'data',
      source: '**/*.json',
      schema: z.object({
        name: z.string(),
        url: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
        startDate: z.date(),
        endDate: z.date(),
        isActive: z.boolean(),
        days: z.array(
          z.object({
            dayOfWeek: z.string(),
            breakfast: z.object({
              mainDish: z.object({
                name: z.string(),
                calories: z.number(),
              }),
            }),
          })
        ),
      }),
    }),
  },
});
