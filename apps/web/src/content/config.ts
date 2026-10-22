import { z, defineCollection } from "astro:content";

const feature = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Plain-language answer to "what is this for?", shown as the article lede. */
    intro: z.string().min(40).max(240),
    /** Symptom → fix rows for the "Common mistakes" callout. */
    mistakes: z.array(z.string().min(10).max(140)).min(2).max(3),
    /** Drawing number on the sheet, 1-8. */
    order: z.number().int().min(1).max(8),
    /** Raw source rendered small in the home index. Must parse with default callbacks. */
    sample: z.string(),
  }),
});

export const collections = { feature };
