# 境野建築板金 ホームページ

静岡県下田市の境野建築板金の公式サイトです。Cloudflare Pages で公開します（ビルド不要、このフォルダをそのまま配信）。

- `index.html` … トップページ（1ページ構成）
- `privacy.html` … 個人情報の取り扱い
- `img/` … 写真（位置情報は削除済み）
- `favicon.svg` / `apple-touch-icon.png` … アイコン

## 公開前にやること
- ドメインが決まったら、`index.html` に canonical と og:url を入れ、`sitemap.xml` を追加し `robots.txt` に Sitemap 行を足す
- お問い合わせフォームの送信先 `/api/contact`（Cloudflare Pages Functions）を用意する
