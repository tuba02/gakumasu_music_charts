// src/components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="mb-4 md:mb-0">
            © {new Date().getFullYear()} 初星学園ファンサイト
          </p>
          <p className="text-sm text-gray-400">
            このサイトは初星学園の公式サイトではありません。ファンによる非公式サイトです。
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;