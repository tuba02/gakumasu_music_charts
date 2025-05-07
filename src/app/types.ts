export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  viewCount: number;
  publishedAt: string;
  channelTitle: string;
  previousViewCount?: number;  // 12時間前の再生数
  viewCountIncrease?: number;  // 再生数増加量
  lastUpdated?: string;        // 最終更新日時
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

// 初星学園のYouTubeチャンネルID
export const HATSUHOSHI_CHANNEL_ID = 'UCQhmyTiv09WYRw5hyClU4CQ';

// 初星学園の音楽プレイリストID
export const HATSUHOSHI_MUSIC_PLAYLIST_ID = 'PLQhmyTiv09WYRw5hyClU4CQ'; 