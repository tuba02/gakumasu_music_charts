// src/app/api/youtube/route.ts
import { NextResponse } from 'next/server';
import { getHatsuhoshiVideosRanking } from '@/app/lib/youtube';
import { ApiResponse } from '@/app/types';

/**
 * 初星学園のYouTube動画を再生数順に取得するAPIエンドポイント
 */
export async function GET(request: Request) {
  try {
    // キャッシュヘッダーを設定（1時間キャッシュ）
    const headers = {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    };

    // 動画データを取得
    const videos = await getHatsuhoshiVideosRanking();
    
    // 成功レスポンスを返す
    const response: ApiResponse = {
      success: true,
      data: videos,
    };
    
    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error('API Error:', error);
    
    // エラーレスポンスを返す
    const errorResponse: ApiResponse = {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * リクエストごとのレート制限を実装するためのオプションを設定
 * APIの過剰な呼び出しを防ぐ
 */
export const runtime = 'edge'; // エッジランタイムを使用
export const dynamic = 'force-dynamic'; // 動的レスポンスを強制
export const revalidate = 3600; // 1時間ごとに再検証（秒単位）