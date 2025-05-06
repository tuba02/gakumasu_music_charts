// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import RankingChart from '@/app/components/RankingChart';
import Loading from '@/app/components/Loading';
import { YouTubeVideo, ApiResponse } from '@/app/types';

export default function Home() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 動画データを取得する関数
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/youtube');
        const data: ApiResponse = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'データの取得に失敗しました');
        }
        
        setVideos(data.data);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="py-4">
      {loading ? (
        <Loading />
      ) : error ? (
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">エラー：</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="container mx-auto px-4 py-4 mb-6">
            <p className="text-center text-gray-600 max-w-3xl mx-auto">
              初星学園のYouTubeチャンネルから、再生数の多い動画をランキング形式で表示しています。
              各動画のサムネイルをクリックすると、YouTubeで視聴できます。
            </p>
          </div>
          
          <RankingChart videos={videos} />
          
          <div className="container mx-auto px-4 py-4 mt-8">
            <p className="text-center text-sm text-gray-500">
              データは1時間ごとに更新されます。最終更新: {new Date().toLocaleString('ja-JP')}
            </p>
          </div>
        </>
      )}
    </div>
  );
}