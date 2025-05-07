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

// 初星学園のYouTubeチャンネルID
export const HATSUHOSHI_CHANNEL_ID = 'UC2dXx-3RXeeP8hA5AGt8vuw';

// 初星学園の音楽プレイリストID
export const HATSUHOSHI_MUSIC_PLAYLIST_ID = 'PL8AmPgz38WkXIiEnqf-Q5XkWpQgm5UiuF'; 