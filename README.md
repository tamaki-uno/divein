# divein

diveinは、トグルメニューのような形でメモができる、Notionのようなメモアプリケーションです。

## 主な特徴

- SQLiteを利用したシンプルなデータベース管理
- ユーザーごとの権限管理
- レコードの作成・更新・削除・検索API
- JWT認証によるセキュリティ
- Node.js/ExpressによるAPIサーバー

## 公開URL

本サービスは以下のURLで公開しています。

👉 [https://divein.onrender.com](https://divein.onrender.com)

## セットアップ方法

1. リポジトリをクローン
2. 必要なパッケージをインストール

   ```bash
   npm install
   ```

3. `.env`ファイルを作成し、必要な環境変数を設定
4. サーバーを起動

   ```bash
   npm start
   ```

## ディレクトリ構成

- `api/v0/` ... APIエンドポイント
- `public/` ... 静的ファイル
- `database.js` ... データベース操作モジュール
- `server.js` ... サーバー起動スクリプト

## ライセンス

---
