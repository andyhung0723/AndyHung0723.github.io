# reader

三欄閱讀器 theme：左側分類（stream）文章列表、中間文章、右側目錄。EJS + 原生 CSS/JS，沒有建置步驟。

## 要改哪裡

| 想改的東西 | 檔案 |
| --- | --- |
| 分類、顏色、舊文門檻、閱讀速度 | `_config.yml` |
| 頁面外框（header / sidebar / main） | `layout/layout.ejs` |
| 文章頁 | `layout/post.ejs` |
| 左側列表 | `layout/_partial/sidebar.ejs` |
| 上一篇 / 下一篇 | `layout/_partial/pager.ejs` |
| 色彩 token、版面、斷點 | `source/css/reader.css`（最上方 `:root`） |
| 鍵盤、搜尋、目錄高亮、抽屜 | `source/js/reader.js` |
| 分類索引、helper、generator | `scripts/stream.js` |

## 分類（stream）

文章依 front-matter 的 `categories` 歸入 stream：第一個 `category` 相符的 stream 勝出，其餘進 `fallback: true` 的那個。每個 stream 自動產生 `/<id>/` 落地頁。上一篇／下一篇與 `j` / `k` 只在同一個 stream 內移動。

新增 stream：在 `_config.yml` 的 `streams` 加一筆，文章 `categories` 填上對應名稱即可。

## 文章 front-matter

```yaml
title: 資安週報｜2026/11/16
date: 2026-11-16
author: AI 協助整理      # 省略時用站台 author
description: 一行導言     # 顯示在標題下，也用於 meta description 與列表摘要
tldr: 優先處理 X 與 Y     # 選填，顯示「先看這裡」框
categories:
  - 資安週報
tags:
  - Linux
```

## 設計決策

- **列表每頁 SSR**：沒 JS 也能導覽，總輸出量隨文章數平方成長；約 300 篇以上再考慮只渲染最近 N 篇。
- **索引每次 generate 建一次**（`before_generate` 重置），helper 都是 O(1) 查表，閱讀時間有快取。
- **CSS/JS 用內容 hash 當版本號**（`asset_url`），改檔不需手動清快取。
- **換頁體感**：`@view-transition` 讓 header / sidebar 不動；Speculation Rules 在 hover 時預先 prerender 文章連結。都是漸進增強。
