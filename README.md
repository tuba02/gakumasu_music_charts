# 初星学園 音楽チャート

初星学園のYouTubeチャンネルから音楽動画を取得し、再生回数ランキングを表示するWebアプリケーションです。

## 機能

- YouTube APIを使用して初星学園の音楽プレイリストから動画を取得
- 再生回数によるランキング表示
- 動画のサムネイル、タイトル、再生回数、公開日の表示
- ダークモード対応
- レスポンシブデザイン

## 技術スタック

- Next.js 14
- TypeScript
- Tailwind CSS
- YouTube Data API v3

## セットアップ

1. リポジトリのクローン
```bash
git clone https://github.com/tuba02/gakumasu_music_charts.git
cd gakumasu_music_charts
```

2. 依存関係のインストール
```bash
pnpm install
```

3. 環境変数の設定
`.env.local`ファイルを作成し、以下の内容を設定：
```
YOUTUBE_API_KEY=your_api_key_here
```

4. 開発サーバーの起動
```bash
pnpm dev
```

## 使用方法

1. アプリケーションにアクセスすると、自動的に初星学園の音楽プレイリストから動画を取得し、再生回数順に表示します。
2. 各動画カードには以下の情報が表示されます：
   - 順位
   - サムネイル画像
   - タイトル
   - 再生回数
   - 公開日
3. 「再生」ボタンをクリックすると、YouTubeで動画を再生できます。

## ライセンス

MIT License

## 作者

[tuba02](https://github.com/tuba02)
