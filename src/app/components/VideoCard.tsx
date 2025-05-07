'use client';

import { YouTubeVideo } from '../types';
import { formatViewCount } from '@/app/lib/utils';

interface VideoCardProps {
  video: YouTubeVideo;
  rank: number;
}

export default function VideoCard({ video, rank }: VideoCardProps) {
  // 公開日をフォーマット
  const formatPublishedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="relative">
        <a 
          href={video.url}
          target="_blank" 
          rel="noopener noreferrer"
          className="block relative"
        >
          <div className="absolute inset-0 bg-black opacity-0 hover:opacity-30 transition-opacity duration-300 flex justify-center items-center">
            <svg className="h-16 w-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full aspect-video object-cover" 
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
          className="text-lg font-semibold hover:text-purple-600 transition-colors duration-200 line-clamp-2"
        >
          {video.title}
        </a>
        
        <div className="mt-2 text-gray-600">
          <div className="flex items-center mt-1">
            <span>{formatViewCount(video.viewCount)} 回視聴</span>
          </div>
          
          <div className="flex items-center mt-1 text-sm">
            <span>公開日: {formatPublishedDate(video.publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 