# サロン自動受付システム (auto-reception)

## Commands
npm run dev        # ローカル開発サーバー（Vite）
npm run build      # 本番ビルド

## Architecture
- Vite + Vanilla JS（フレームワークなし）
- Firebase Firestore v8 compat（npm経由）
- Slack Webhook + Bot Token で通知
- Vercel ホスティング（GitHub push → 自動デプロイ）
- 多店舗対応：STORE_ID でデータ分離

## File Layout
- html_body.txt → HTMLテンプレート（リポジトリルート）
- src/main.js → エントリポイント
- src/app.js → 受付+管理画面ロジック
- src/style.css → 全スタイル

## STORE_ID Rules（絶対厳守）
- 環境変数: import.meta.env.VITE_STORE_ID || 'muuk-hiratsuka'
- localStorage キー: ${STORE_ID}_ プレフィックス必須
- Firestore doc ID: salon/${STORE_ID}, logs/${STORE_ID}_${YYYY-M-D}
- 書き込みは必ず {merge: true}

## Conventions
- デフォルトデータをハードコードしない（空配列で初期化）
- HTML onclick から呼ぶ関数は必ず window に公開
- html_body.txt と app.js の整合性を必ず確認してからコミット
- console.log 禁止、console.warn/error のみ

## Watch Out For
- onclick 関数が app.js に存在しないとランタイムエラー
- app (1).js のような重複ファイルが src/ にあれば削除
