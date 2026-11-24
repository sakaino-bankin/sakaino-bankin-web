# 境野建築板金 ホームページ

静岡県下田市の境野建築板金の公式サイトです。Cloudflare Workers で公開します（ビルド不要、`public/` の中身をそのまま配信。設定は `wrangler.jsonc`）。

- `public/index.html` … トップページ（1ページ構成）
- `public/privacy.html` … 個人情報の取り扱い
- `public/img/` … 写真（位置情報は削除済み）
- `public/favicon.svg` / `apple-touch-icon.png` … アイコン

## 公開前にやること
- ドメイン：https://sakaino-bankin.com/
- お問い合わせフォームの送信先 `/api/contact` を Worker で用意する
