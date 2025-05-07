export interface YouTubeVideo {
  id: string;
  title: string;
  viewCount: number;
  previousViewCount?: number;
  viewCountIncrease?: number;
  lastUpdated?: string;
  thumbnail?: string;
  url?: string;
  publishedAt?: string;
  channelTitle?: string;
}

export interface YouTubeApiResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeApiItem[];
}

export interface YouTubeApiItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
}

export interface VideoStats {
  video_id: string;
  title: string;
  view_count: number;
  previous_view_count: number;
  increase: number;
  last_updated: string;
}

// 初星学園のYouTubeチャンネルID
export const HATSUHOSHI_CHANNEL_ID = 'UC2dXx-3RXeeP8hA5AGt8vuw';

// 初星学園の音楽プレイリストID
export const HATSUHOSHI_MUSIC_PLAYLIST_ID = 'PL8AmPgz38WkXIiEnqf-Q5XkWpQgm5UiuF'; 