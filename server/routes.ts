import type { Express } from "express";
import { createServer, type Server } from "http";
import { rssResponseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // RSS proxy endpoint to handle CORS
  app.get("/api/rss", async (req, res) => {
    try {
      const RSS_FEED_URL = 'https://medium.com/@kingsillu/feed';
      const CORS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';
      
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(RSS_FEED_URL)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Clean up the data before validation
      if (data.items) {
        data.items = data.items.map((item: any) => {
          const cleanedItem = {
            title: item.title || '',
            link: item.link || '',
            pubDate: item.pubDate || '',
            description: item.description || '',
            content: item.content || '',
            guid: item.guid || item.link || ''
          };
          
          // Only add thumbnail if it's a valid HTTP URL
          if (item.thumbnail && 
              typeof item.thumbnail === 'string' && 
              item.thumbnail.trim() !== '' && 
              item.thumbnail.startsWith('http')) {
            (cleanedItem as any).thumbnail = item.thumbnail.trim();
          }
          
          return cleanedItem;
        });
      }
      
      // Try validation
      const validatedData = rssResponseSchema.safeParse(data);
      
      if (!validatedData.success) {
        console.log('Validation failed with errors:', validatedData.error.issues);
        throw new Error(`Validation failed: ${validatedData.error.message}`);
      }
      
      const result = validatedData.data;
      
      if (result.status !== 'ok') {
        throw new Error('Failed to parse RSS feed');
      }
      
      res.json(result);
    } catch (error) {
      console.error('RSS fetch error:', error);
      res.status(500).json({ 
        message: 'Failed to fetch RSS feed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
