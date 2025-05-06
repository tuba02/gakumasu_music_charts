// src/components/Loading.tsx
import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      <p className="ml-4 text-lg text-gray-600">ランキングデータを読み込み中...</p>
    </div>
  );
};

export default Loading;