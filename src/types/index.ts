export interface YouTubeVideo {
  id: string;
  title: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  thumbnailUrl: string;
}

export interface ApiResponse {
  videos: YouTubeVideo[];
  error?: string;
} 