// src/app/page.tsx
import { getHatsuhoshiVideosRanking } from './lib/youtube';
import VideoCard from '@/app/components/VideoCard';
import { YouTubeVideo } from '@/app/types';

export const revalidate = 3600; // 1時間ごとに再検証

export default async function Home() {
  try {
    const videos = await getHatsuhoshiVideosRanking();
    const lastUpdated = new Date().toISOString();

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8">
          初星学園 音楽チャート
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {videos.map((video, index) => (
            <VideoCard key={video.id} video={video} rank={index + 1} />
          ))}
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">
          データは1時間ごとに更新されます。最終更新: {new Date(lastUpdated).toLocaleString('ja-JP')}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">エラー：</strong>
          <span className="block sm:inline">
            {error instanceof Error ? error.message : '不明なエラーが発生しました'}
          </span>
        </div>
      </div>
    );
  }
}