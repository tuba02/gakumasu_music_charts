// RankingChart.tsx
// ランキングチャートを表示するコンポーネント

// src/components/RankingChart.tsx
import React from 'react';
import { YouTubeVideo } from '@/app/types';

interface RankingChartProps {
  videos: YouTubeVideo[];
}

const RankingChart: React.FC<RankingChartProps> = ({ videos }) => {
  // 再生回数をフォーマットする関数
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // 再生回数の表示スタイルを取得する関数
  const getViewCountStyle = (count: number): string => {
    if (count >= 1000000) {
      return 'text-purple-600 dark:text-purple-400 font-bold';
    } else if (count >= 100000) {
      return 'text-blue-600 dark:text-blue-400 font-bold';
    } else if (count >= 10000) {
      return 'text-green-600 dark:text-green-400 font-bold';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  // 日付をフォーマットする関数
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">再生回数ランキング</h2>
      <div className="space-y-4">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center space-x-4">
              {/* 順位表示 */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-xl">
                {index + 1}
              </div>
              
              {/* サムネイル */}
              <div className="flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-32 h-20 object-cover rounded-lg"
                />
              </div>

              {/* 動画情報 */}
              <div className="flex-grow">
                <h3 className="text-lg font-semibold mb-1 line-clamp-2">
                  {video.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                  <span className={`flex items-center ${getViewCountStyle(video.viewCount)}`}>
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    {formatViewCount(video.viewCount)}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {formatDate(video.publishedAt ?? new Date().toISOString())}
                  </span>
                </div>
              </div>

              {/* 再生ボタン */}
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                再生
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingChart;