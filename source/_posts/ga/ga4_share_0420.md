---
title: "GA4 vs GA3 來源/媒介 BigQuery 欄位解析"
date: 2023-04-20
author: "Amy"
categories:
  - Google Analytics
---

👉 文章內容深度 : 3/5顆星
👉 適用對象 : 有使用 BigQuery 製作來源/媒介報表

<!-- more -->

### ▶ **什麼是來源/媒介 ?**

簡單來說就是判斷這個流量從哪邊來? 是從 Google 搜尋引擎進入網站還是從 FB 粉專進入網站。
以下為 GA3 & GA4 的來源/媒介報表路徑

-   GA3 : 獲客 > 所有流量 > 來源/媒介
-   GA4 : 獲客 > 流量開發 : 工作階段預設管道分組 (如下圖)
    ![](https://i.imgur.com/hVTllIw.png)

### ▶ **GA3 vs. GA4 BigQuery 來源/媒介欄位比較表**

GA3 時代，從 BigQuery 中提取來源/媒介數據時，會使用欄位「trafficSource.source」&「trafficSource.medium」，這是沒有錯的!這兩個欄位代表的是每次進站的渠道。
<[附上 GA3 匯出 BigQuery 的結構定義](https://support.google.com/analytics/answer/3437719?hl=zh-Hant)\>

當看到 GA4 匯出到 BigQuery 的 Dataset 中看到「traffic_source.source」&「traffic_source.medium」時，心中是不是無比喜悅，就是他惹 :100:

**但是!** 現在我們來看一下 Google 的官方文件說明(附上截圖&[文件](https://support.google.com/analytics/answer/7029846?hl=zh-Hant&ref_topic=9359001&sjid=6130283979471431016-AP#zippy=%2Ctraffic-source))，
補充:這兩個欄位會對應到 GA4 維度為「最初招攬到使用者的來源/媒介」

-   traffic_source.source : 初次招攬到使用者的聯播網名稱。
-   traffic_source.medium : 初次招攬到使用者的媒介名稱。

![](https://i.imgur.com/6Ukf3Ai.png)

「初次招攬」指的是第一次進到網站的使用者是從哪個渠道進入網站，是 FB 廣告還是 Google 自然搜尋等等。
舉例來說 :
小明點了 Google 廣告，**第一次**進到網站中，那欄位值會如下

-   traffic_source.source : google
-   traffic_source.medium : cpc

那小明隔天從 LINE 官方帳號進入網站，那欄位值是什麼?
*值還是一樣的 ! 因為「traffic_source.source 和 traffic_source.medium 這兩個欄位就是這兩個欄位僅記錄用戶首次訪問網站時的來源媒介*

-   traffic_source.source : google
-   traffic_source.medium : cpc

### ▶**那第2次的來源媒介要怎麼取得?**

GA4 的數據模型是由事件組成，所以每個 event_name 對應一個資料列。
event_name = page_view 指的就是每一次的網站瀏覽，所以第二次進站的來源媒介，會出現在事件名為 page_view 的資料列中，包含 source 和 medium 參數。

### ▶**2種情境與對應值，分享給大家**

#### 情境1 :小明從 Google 自然搜尋第1次進站到首頁，點了站內 UTM(Urchin Tracking Module) 到活動頁

下表為 BQ 中的資料列示意

| event_date | event_name | event_params.key | event_params_value.string_value | traffic_source.source | traffic_source.medium |
| --- | --- | --- | --- | --- | --- |
| 20230222 | first_visit | page_location | 首頁網址 | google | organic |
| 20230222 | session_start | page_location | 首頁網址 | google | organic |
| 20230222 | page_view | page_location | 首頁網址 | google | organic |
|  |  | source | google |  |  |
|  |  | medium | organic |  |  |
| 20230222 | page_view | page_location | 站內UTM活動頁 | google | organic |
|  |  | source | Amy1 |  |  |
|  |  | medium | Test1 |  |  |

#### 情境2 : 延續情境1，隔天小明點了 FB 粉專的貼文進入了網站商品頁，粉專貼文的連結有帶 UTM 為 Facebook / post

下表為 BQ 中的資料列示意

| event_date | event_name | event_params.key | event_params_value.string_value | traffic_source.source | traffic_source.medium |
| --- | --- | --- | --- | --- | --- |
| 20230223 | session_start | page_location | 商品頁 | google | organic |
| 20230223 | page_view | page_location | 商品頁 | google | organic |
|  |  | source | Facebook |  |  |
|  |  | medium | post |  |  |

#### 結論 : traffic_source 欄位僅記錄用戶首次訪問網站時的來源媒介，不會因未來用戶進入網站的渠道而改變其值。

附上查詢 SQL

```sql
SELECT event_date,event_name, event_params, traffic_source.source, traffic_source.medium
FROM `你的工作表名稱`
```
