// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getHatsuhoshiVideosRanking } from './lib/youtube';
import VideoCard, { VideoCardSkeleton } from '@/app/components/VideoCard';
import { YouTubeVideo } from '@/app/types';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import ScrollToTop from '@/app/components/ScrollToTop';

export const revalidate = 12 * 3600; // 12時間ごとに再検証

export default function Home() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const { videos: newVideos, lastUpdated: newLastUpdated } = await getHatsuhoshiVideosRanking();
      setVideos(newVideos);
      setLastUpdated(newLastUpdated);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8">
          初星学園 音楽チャート
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, index) => (
            <VideoCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8">
          初星学園 音楽チャート
        </h1>
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative max-w-lg mx-auto" role="alert">
          <strong className="font-bold">エラー：</strong>
          <span className="block sm:inline mb-4">{error}</span>
          <Button
            onClick={fetchVideos}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

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
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        データは12時間ごとに更新されます。最終更新: {new Date(lastUpdated).toLocaleString('ja-JP')}
      </div>
      <ScrollToTop />
    </div>
  );
}