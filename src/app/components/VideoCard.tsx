'use client';

import { YouTubeVideo } from '@/app/types';
import Image from 'next/image';
import Link from 'next/link';
import { formatViewCount } from '@/app/lib/utils';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Share2 } from 'lucide-react';

interface VideoCardProps {
  video: YouTubeVideo;
  rank: number;
}

// スケルトンローディングコンポーネント
export function VideoCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="relative">
        <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700" />
        <div className="absolute top-0 left-0 bg-gray-300 dark:bg-gray-600 w-8 h-8" />
      </div>
      <div className="p-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="mt-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        </div>
      </div>
    </div>
  );
}

export default function VideoCard({ video, rank }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  // 公開日をフォーマット
  const formatPublishedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // シェア機能
  const shareVideo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `${video.title} - 初星学園`,
          url: video.url,
        });
      } catch (err) {
        console.error('シェアに失敗しました:', err);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="relative">
        <a 
          href={video.url}
          target="_blank" 
          rel="noopener noreferrer"
          className="block relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300 flex justify-center items-center">
            <svg className="h-16 w-16 text-white transform scale-100 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <img 
            src={video.thumbnail}
            alt={video.title}
            className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105" 
          />
          <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 text-lg font-bold">
            {rank}
          </div>
        </a>
      </div>

      <div className="p-4 flex-grow">
        <a 
          href={video.url}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 line-clamp-2"
        >
          {video.title}
        </a>
        
        <div className="mt-2 text-gray-600 dark:text-gray-300">
          <div className="flex items-center justify-between mt-1">
            <span>{formatViewCount(video.viewCount)} 回視聴</span>
          </div>
          
          <div className="flex items-center mt-1 text-sm">
            <span>公開日: {formatPublishedDate(video.publishedAt)}</span>
          </div>
        </div>

        {/* シェアボタン */}
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={shareVideo}
            className="w-full border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Share2 className="h-4 w-4 mr-2" />
            シェア
          </Button>
        </div>
      </div>
    </div>
  );
} 