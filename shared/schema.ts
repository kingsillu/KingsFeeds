import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string(),
  link: z.string().url(),
  pubDate: z.string(),
  description: z.string().optional(),
  content: z.string().optional(),
  thumbnail: z.string().optional(),
  guid: z.string(),
});

export const rssResponseSchema = z.object({
  status: z.string(),
  feed: z.object({
    title: z.string(),
    description: z.string(),
    link: z.string(),
  }),
  items: z.array(blogPostSchema),
});

export type BlogPost = z.infer<typeof blogPostSchema>;
export type RSSResponse = z.infer<typeof rssResponseSchema>;
