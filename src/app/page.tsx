// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import RankingChart from '@/app/components/RankingChart';
import Loading from '@/app/components/Loading';
import { YouTubeVideo, ApiResponse } from '@/app/types';
import { getHatsuhoshiVideosRanking } from './lib/youtube';
import VideoCard from '@/app/components/VideoCard';

export default function Home() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/youtube');
        const data: ApiResponse = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'データの取得に失敗しました');
        }
        
        setVideos(data.data);
        setLastUpdated(data.lastUpdated || '');
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">エラー：</strong>
          <span className="block sm:inline">{error}</span>
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
      <div className="mt-8 text-center text-sm text-gray-500">
        データは1時間ごとに更新されます。最終更新: {lastUpdated ? new Date(lastUpdated).toLocaleString('ja-JP') : '読み込み中...'}
      </div>
    </div>
  );
}