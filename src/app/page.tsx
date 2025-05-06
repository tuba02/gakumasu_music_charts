// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import RankingChart from '@/app/components/RankingChart';
import Loading from '@/app/components/Loading';
import { YouTubeVideo, ApiResponse } from '@/app/types';
import { getHatsuhoshiVideosRanking } from './lib/youtube';
import VideoCard from './components/VideoCard';

export default async function Home() {
  const videos = await getHatsuhoshiVideosRanking();

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
    </div>
  );
}