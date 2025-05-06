import { YouTubeVideo } from '../types';
import { formatViewCount } from '../lib/utils';

interface VideoCardProps {
  video: YouTubeVideo;
  rank: number;
}

export default function VideoCard({ video, rank }: VideoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <a
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full aspect-video object-cover"
          />
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-sm font-bold">
            {rank}位
          </div>
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
            {formatViewCount(video.viewCount)}回
          </div>
        </a>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold line-clamp-2 mb-2">
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors duration-200"
          >
            {video.title}
          </a>
        </h3>
        <p className="text-sm text-gray-600">
          {new Date(video.publishedAt).toLocaleDateString('ja-JP')}
        </p>
      </div>
    </div>
  );
} 