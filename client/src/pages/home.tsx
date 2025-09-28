import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RSSResponse, BlogPost } from "@shared/schema";
import { useEffect } from "react";

export default function Home() {
  const { toast } = useToast();

  const {
    data: rssData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery<RSSResponse>({
    queryKey: ["rss-feed"],
    queryFn: async () => {
      // Fetch directly from RSS2JSON API for static deployment
      const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/@kingsillu/feed');
      if (!response.ok) {
        throw new Error('Failed to fetch RSS feed');
      }
      const data = await response.json();
      
      // Transform data to match our schema
      return {
        ...data,
        items: data.items?.map((item: any) => ({
          ...item,
          thumbnail: item.thumbnail || item.enclosure?.link || '',
          description: item.description?.replace(/<[^>]*>/g, '').trim() || '',
        })) || []
      };
    },
    refetchInterval: 300000, // Refresh every 5 minutes
    refetchOnWindowFocus: true,
  });

  // Show toast on error
  useEffect(() => {
    if (error) {
      toast({
        title: "Failed to load posts",
        description: "We're having trouble connecting to our blog feed. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const extractImageFromContent = (content: string) => {
    const imgRegex = /<img[^>]+src="([^">]+)"/i;
    const match = content.match(imgRegex);
    return match ? match[1] : null;
  };

  const createExcerpt = (description: string = "", content: string = "") => {
    // First try description, then fall back to content
    let text = description || content || '';
    
    // Remove HTML tags completely
    text = text.replace(/<[^>]*>/g, '');
    
    // Remove extra whitespace and clean up
    text = text.replace(/\s+/g, ' ').trim();
    
    // Create excerpt
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  const BlogPostCard = ({ post, index }: { post: BlogPost; index: number }) => {
    const imageUrl = post.thumbnail || extractImageFromContent(post.content || '');
    const excerpt = createExcerpt(post.description, post.content);

    return (
      <Card 
        className="overflow-hidden hover-lift fade-in bg-card border-border"
        style={{ animationDelay: `${index * 0.1}s` }}
        data-testid={`blog-post-card-${post.guid}`}
      >
        <div className="p-6 flex gap-6">
          {/* Content Section */}
          <div className="flex-1">
            <h2 className="font-serif text-2xl font-bold text-text-primary mb-2 leading-tight hover:text-medium-green transition-colors">
              <a 
                href={post.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
                data-testid={`blog-post-title-${post.guid}`}
              >
                {post.title}
              </a>
            </h2>
            
            <p 
              className="text-text-secondary text-base leading-relaxed mb-4"
              data-testid={`blog-post-excerpt-${post.guid}`}
            >
              {excerpt}
            </p>
            
            <div className="flex items-center justify-between">
              <time 
                className="text-sm text-text-secondary font-medium"
                data-testid={`blog-post-date-${post.guid}`}
              >
                {formatDate(post.pubDate)}
              </time>
              
              <Button
                asChild
                className="bg-medium-green hover:bg-green-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-medium-green focus:ring-offset-2"
                data-testid={`blog-post-read-more-${post.guid}`}
              >
                <a 
                  href={post.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  Read More
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          </div>
          
          {/* Image Section */}
          {imageUrl && (
            <div className="w-32 h-32 flex-shrink-0">
              <img 
                src={imageUrl} 
                alt={post.title}
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
                data-testid={`blog-post-image-${post.guid}`}
              />
            </div>
          )}
        </div>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="bg-card border-border p-8 hover-lift">
          <Skeleton className="h-48 w-full rounded-lg mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );

  const ErrorState = () => (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="font-serif text-xl font-bold text-text-primary mb-2">
          Unable to Load Posts
        </h3>
        <p className="text-text-secondary mb-6">
          We're having trouble connecting to our blog feed. Please try again later.
        </p>
        <Button 
          onClick={() => refetch()}
          disabled={isRefetching}
          className="bg-medium-green hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
          data-testid="retry-button"
        >
          {isRefetching ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            'Try Again'
          )}
        </Button>
      </div>
    </div>
  );

  const NoPostsState = () => (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
          </svg>
        </div>
        <h3 className="font-serif text-xl font-bold text-text-primary mb-2">
          No Posts Yet
        </h3>
        <p className="text-text-secondary">
          Check back soon for fresh content and insights.
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-background text-foreground font-sans min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-text-primary">
                KingsFeeds
              </h1>
              <ThemeToggle />
            </div>
            <p className="text-text-secondary text-lg font-light max-w-2xl mx-auto mb-4">
              Thoughtful stories, insights, and perspectives that spark curiosity and meaningful conversations
            </p>
            <a 
              href="https://medium.com/@kingsillu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-medium-green hover:bg-green-700 text-white px-6 py-3 rounded-full text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75S24 8.83 24 12z"/>
              </svg>
              Follow on Medium
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stay Curious Section */}
            <div className="bg-card border border-border rounded-lg p-6 hover-lift">
              <h3 className="font-serif text-xl font-bold text-text-primary mb-3">
                Stay Curious
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Follow us on Medium for more thought-provoking content and join our community of curious minds.
              </p>
            </div>
          </div>

          {/* Main Blog Posts */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <ErrorState />
            ) : !rssData?.items?.length ? (
              <NoPostsState />
            ) : (
              <div className="space-y-8" data-testid="blog-posts-container">
                {rssData.items.map((post, index) => (
                  <BlogPostCard key={post.guid} post={post} index={index} />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* About Section */}
            <div className="bg-card border border-border rounded-lg p-6 hover-lift">
              <h3 className="font-serif text-xl font-bold text-card-foreground mb-4">
                About KingsFeeds
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                KingsFeeds is your one-stop hub for stories, ideas, and bold imagination. 🚀
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                We bring you the strange, the smart, the thrilling, and the unexpected — all straight from Kingsillu's mind. 🧠🔥
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                From haunted buses to futuristic robots, every post is a fresh twist that keeps you hooked. 👻🤖
              </p>
              <div className="flex items-center text-sm text-card-foreground font-medium">
                📚 Powered by creativity, made for readers who dare to explore.
              </div>
            </div>

            {/* Latest Posts */}
            <div className="bg-card border border-border rounded-lg p-6 hover-lift">
              <h3 className="font-serif text-xl font-bold text-text-primary mb-3">
                Recent Posts
              </h3>
              {rssData?.items?.slice(0, 3).map((post, index) => (
                <div key={`sidebar-${post.guid}`} className="mb-3 last:mb-0">
                  <a 
                    href={post.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <h4 className="text-sm font-medium text-text-primary group-hover:text-medium-green transition-colors line-clamp-2 leading-tight mb-1">
                      {post.title}
                    </h4>
                    <time className="text-xs text-text-secondary">
                      {formatDate(post.pubDate)}
                    </time>
                  </a>
                  {index < 2 && <hr className="my-3 border-border" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted mt-16">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-muted-foreground mb-4">
            © 2025 KingsFeeds. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Powered by KingsFeeds
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            Thank You
          </p>
        </div>
      </footer>
    </div>
  );
}
