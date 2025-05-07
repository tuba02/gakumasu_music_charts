// src/types/index.ts

// YouTubeから取得した動画の情報を格納する型
export interface YouTubeVideo {
    id: string;            // 動画のID（YouTubeのURL用）
    title: string;         // 動画のタイトル
    thumbnail: string;     // サムネイル画像のURL
    viewCount: number;     // 再生回数
    publishedAt: string;   // 公開日時
    channelTitle: string;  // チャンネル名
    url: string;           // 動画へのフルURL
  }
  
  // APIレスポンスのための型
  export interface ApiResponse {
    success: boolean;      // API呼び出しが成功したかどうか
    data: YouTubeVideo[];  // 動画データの配列
    error?: string;        // エラーがあれば、そのメッセージ
    lastUpdated?: string;  // データの最終更新時間
  }
  
  // YouTube APIからのレスポンスを処理するための型
  // これらは実際のYouTube APIのレスポンス構造に合わせて定義
  export interface YouTubeApiResponse {
    items: YouTubeApiItem[];
    nextPageToken?: string;
  }
  
  export interface YouTubeApiItem {
    id: string;
    snippet: {
      title: string;
      thumbnails: {
        medium: {
          url: string;
        };
        high: {
          url: string;
        };
      };
      publishedAt: string;
      channelTitle: string;
    };
    statistics: {
      viewCount: string;
      likeCount: string;
      commentCount: string;
    };
  }
  
  // 初星学園のチャンネル情報
  export const HATSUHOSHI_CHANNEL_ID = "UC2dXx-3RXeeP8hA5AGt8vuw";

  // 初星学園のMusicプレイリストID
  export const HATSUHOSHI_MUSIC_PLAYLIST_ID = "PL8AmPgz38WkXIiEnqf-Q5XkWpQgm5UiuF"; 