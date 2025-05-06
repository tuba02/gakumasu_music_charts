// SongCard.tsx
// 曲のカードを表示するコンポーネント




// src/components/SongCard.tsx
import React from 'react';
import { YouTubeVideo } from '@/app/types';

interface SongCardProps {
  video: YouTubeVideo;
  rank: number;
}

const SongCard: React.FC<SongCardProps> = ({ video, rank }) => {
  // 再生回数をフォーマット（例: 1,234,567）
  const formatViewCount = (count: number): string => {
    return count.toLocaleString();
  };

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
        {/* ランキングバッジ */}
        <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-1 px-3 rounded-full font-bold shadow-md">
          {rank}位
        </div>
        
        {/* サムネイルの周りのリンク（クリック可能な領域） */}
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
            className="w-full h-48 object-cover" 
          />
        </a>
      </div>
      
      <div className="p-4 flex-grow">
        <a 
          href={video.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-lg font-semibold hover:text-purple-600 transition-colors duration-200"
        >
          {video.title}
        </a>
        
        <div className="mt-2 text-gray-600">
          <div className="flex items-center mt-1">
            <svg className="h-5 w-5 text-red-500 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.435c-1.989-5.399-12-4.597-12 3.568 0 4.068 3.06 9.481 12 14.997 8.94-5.516 12-10.929 12-14.997 0-8.118-10-8.999-12-3.568z" />
            </svg>
            <span>{formatViewCount(video.viewCount)} 回視聴</span>
          </div>
          
          <div className="flex items-center mt-1 text-sm">
            <svg className="h-4 w-4 text-gray-500 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 12v-6h-2v8h7v-2h-5z" />
            </svg>
            <span>公開日: {formatPublishedDate(video.publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongCard;