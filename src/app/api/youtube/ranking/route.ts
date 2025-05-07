import { NextResponse } from 'next/server';
import {
  getVideoIdsFromChannel,
  getVideoIdsFromPlaylist,
  getVideosDetails
} from '@/app/lib/youtube';
import { HATSUHOSHI_CHANNEL_ID, HATSUHOSHI_MUSIC_PLAYLIST_ID } from '@/app/types';
import { YouTubeVideo } from '@/app/types';

export async function GET() {
  try {
    // プレイリストから動画IDを取得
    const playlistVideoIds = await getVideoIdsFromPlaylist(HATSUHOSHI_MUSIC_PLAYLIST_ID);
    
    // チャンネルから動画IDを取得
    const channelVideoIds = await getVideoIdsFromChannel(HATSUHOSHI_CHANNEL_ID);
    
    // 重複を除去した動画IDリストを作成
    const uniqueVideoIds = Array.from(new Set([...playlistVideoIds, ...channelVideoIds]));
    
    // 動画IDから詳細情報を取得
    const videos = await getVideosDetails(uniqueVideoIds);
    
    // 重複を除去
    const uniqueVideos = new Map<string, YouTubeVideo>();
    videos.forEach(video => {
      if (!uniqueVideos.has(video.id)) {
        uniqueVideos.set(video.id, video);
      }
    });

    // 再生回数で降順ソート
    const sortedVideos = Array.from(uniqueVideos.values())
      .sort((a: YouTubeVideo, b: YouTubeVideo) => b.viewCount - a.viewCount);

    return NextResponse.json(sortedVideos);
  } catch (error) {
    console.error('Error in ranking API:', error);
    return NextResponse.json(
      { error: 'ランキングの取得に失敗しました' },
      { status: 500 }
    );
  }
} 