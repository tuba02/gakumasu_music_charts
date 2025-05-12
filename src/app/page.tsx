// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import VideoCard, { VideoCardSkeleton } from '@/app/components/VideoCard';
import { YouTubeVideo } from '@/app/types';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';
import ScrollToTop from '@/app/components/ScrollToTop';

interface VideoData {
  videos: YouTubeVideo[];
  increaseRanking: YouTubeVideo[];
  lastUpdated: string;
}

export default function Home() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [increaseRanking, setIncreaseRanking] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'total' | 'increase'>('total');

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/youtube/ranking');
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch videos');
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format from server');
      }

      const data = await response.json();
      setVideos(data.videos);
      setIncreaseRanking(data.increaseRanking);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : '動画の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleRefresh = () => {
    fetchVideos();
  };

  const displayedVideos = activeTab === 'total' ? videos : increaseRanking;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            初星学園 Music Chart
          </h1>
          <div className="flex gap-4">
            <Button
              variant={activeTab === 'total' ? 'default' : 'outline'}
              onClick={() => setActiveTab('total')}
            >
              総再生数
            </Button>
            <Button
              variant={activeTab === 'increase' ? 'default' : 'outline'}
              onClick={() => setActiveTab('increase')}
            >
              急上昇
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedVideos.map((video, index) => (
              <VideoCard key={video.id} video={video} rank={index + 1} />
            ))}
          </div>
        )}

        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>データは一日ごとに更新されます</p>
          {lastUpdated && (
            <p>最終更新: {new Date(lastUpdated).toLocaleString('ja-JP')}</p>
          )}
        </footer>
      </div>
      <ScrollToTop />
    </main>
  );
}
