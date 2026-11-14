---
title: "技術週報｜2026-11-09"
date: 2026-11-09
author: "AI 協助整理"
description: "本期 20 則：GitHub Actions 政策、AI Agent 權限與治理、Cloud Run，以及 Python、Angular、OpenTelemetry 更新。"
categories:
  - 技術雷達
tags:
  - AI
  - CI/CD
  - DevOps
  - GCP
  - GitHub Actions
  - Python
---

2026/11/02–11/08 的 20 則技術更新。11/13 依官方公告複核；以下建議是適用條件與測試方向，不代表任何特定環境已受影響。

<!-- more -->

## 01｜GitHub Actions：公開專案的 pull_request_target 政策

**11/02 公告｜12/02 生效**

GitHub.com 公開 repository 的 `pull_request_target` 將預設遭封鎖，除非適用的 Actions event policy 明確允許。Private、internal repository 與 GitHub Enterprise Server 不在本次範圍。此事件能接觸 base repository 的權限與 secrets，執行 fork 的不可信程式碼尤其需要審慎。

**先做什麼：** 搜尋 workflow 的觸發事件，查看 Actions Insights 的影響紀錄。優先評估 `pull_request`；必要例外應限縮到特定 workflow。兩次短暫強制測試為台灣時間 11/10、11/17 的 00:00–02:00，第一次已過。

[官方公告](https://github.blog/changelog/2026-11-02-pull_request_target-blocked-by-default-december-2/)

## 02｜Gemini Code Assist：既有綁定權益將結束

**11/06 公告｜2027/03/31 截止**

既有 Gemini Enterprise Standard／Plus 訂閱附帶的 Code Assist 權益將於 2027/03/31 移除，在此之前僅支援 Gemini 3.x 模型系列。自 10/09 起，新訂閱已不再附帶該權益；Google 提出 Antigravity 作為開發流程的遷移選項。

**先做什麼：** 核對授權來源，再評估替代工具。這不是所有 Code Assist 授權都在同一天停用的公告，獨立訂閱需另查適用條款。

[Gemini Enterprise 發布紀錄](https://docs.cloud.google.com/gemini/enterprise/docs/release-notes)

## 03｜OpenTelemetry JavaScript SDK 3.0

**11/05 發布**

最低 Node.js 版本提高至 22.15.0，停止支援 Node.js 18、20；改善 ESM／CommonJS 匯出，將 Logs API 納入 `@opentelemetry/api`，並整併 tracing SDK。部分舊相容套件與 API 移除。穩定版 SDK 2.x 在 3.0 發布後仍有一年支援。

**先做什麼：** 盤點 Node.js runtime、exporter 與 `@opentelemetry/*` 相依版本，依 migration guide 測試 traces、metrics、logs。這次變更不要求 Python SDK 一併升級。

[官方發布與遷移說明](https://opentelemetry.io/blog/2026/otel-js-sdk-3-0/)

## 04｜Container-Optimized OS：LTS 安全更新

**11/06 發布**

COS 125、129 發布 LTS refresh，包含系統與容器相關元件修正。COS 125 的映像版本為 `cos-125-19216-801-14`；實際漏洞清單、runtime 與 kernel 版本應依使用的 milestone 核對，不能跨映像套用。

**先做什麼：** 查明主機 boot image，安排支援的更新與必要重啟，先驗證容器能正常啟動。Ubuntu、Debian 等其他映像不適用這份 COS 修補清單。

[COS 125 發布紀錄](https://docs.cloud.google.com/container-optimized-os/docs/release-notes/m125) · [COS 129 發布紀錄](https://docs.cloud.google.com/container-optimized-os/docs/release-notes/m129)

## 05｜API Gateway：Streaming backend 認證調整

**11/03 發布**

啟用 streaming 的 gateway，對主機名稱以 `.googleapis.com` 或 `.vertexai.goog` 結尾的 backend，改用 gateway service account 的 access token；其他 backend 仍接收 ID token。既有 gateway 會在平台下次更新，或切換新 API config 時套用。

**先做什麼：** 使用 Vertex AI 等 Google API backend 的流程，應測試 token 類型、IAM 權限及更新後的認證結果。未使用 streaming gateway 者不必為此修改服務。

[API Gateway 發布紀錄](https://docs.cloud.google.com/api-gateway/docs/release-notes)

## 06｜Claude Code 2.1.319：Auto Mode 與 MCP 背景任務

**11/06 發布**

部分停用 telemetry／feature flag 或使用 LLM gateway 的 Auto Mode 情境，伺服器無法檢查的工具呼叫會改為詢問或拒絕，不再自動回退至內建分類器。Bedrock、Vertex、Foundry 的相關行為不變。新版也支援 MCP task 背景執行、`permissions.denyInsteadOfPrompting`，以及 `/claude-api latency-optimize`。

**先做什麼：** 升級前測試非互動式流程的授權、MCP 任務完成通知與失敗恢復，不要為了讓流程跑完而全面放寬權限。

[v2.1.319 release](https://github.com/anthropics/claude-code/releases/tag/v2.1.319)

## 07｜Claude API：IP Allowlist Beta

**11/05 發布**

Claude Console 可設定組織層級的 IP allowlist，支援 IPv4、IPv6 與 CIDR，每組織最多 1,000 項。受涵蓋服務會拒絕清單以外的來源，降低 API key 外洩後可被使用的範圍；仍須確認服務涵蓋限制。

**先做什麼：** 先盤點出口 IP，再測試固定 NAT 與來源限制。使用動態出口的工作負載若直接啟用清單，可能被自己擋下。

[Claude Platform 發布紀錄](https://platform.claude.com/docs/en/release-notes/overview)

## 08｜Agent Registry：Skill 版本與安全治理 GA

**11/06 發布**

Standalone skills 正式 GA，提供 `Skill`、不可變的 `SkillRevision`、publisher 資訊，以及註冊、搜尋與版本管理。安全掃描可產生 findings，搭配 Organization Policy 與 IAM 控制使用；skill payload 的 CMEK 保護仍為 Preview。

**先做什麼：** 以少量共用 skills 測試版本固定、來源審核、掃描結果與最小權限。掃描通過不等於可免除人工檢查。

[Agent Registry 發布紀錄](https://docs.cloud.google.com/agent-registry/release-notes)

## 09｜Claude Messages API：Message Threads Beta

**11/02 發布**

伺服器可暫存對話，後續請求只傳新增訊息，減少 payload 並改善首 token 延遲。使用 `message-threads-2026-08-12` beta header；thread 在最後請求後 5 分鐘過期，最後使用後最多 1 小時內刪除。

**先做什麼：** 用多輪 tool calling 比較延遲、傳輸量及失敗恢復。它不是長期記憶或永久對話儲存。

[Claude Platform 發布紀錄](https://platform.claude.com/docs/en/release-notes/overview)

## 10｜Cloud Run：Ephemeral Disk GA

**11/04 發布**

Cloud Run ephemeral disk 已正式 GA，可在 service、job 或 worker pool 掛載只存續於該 instance 生命週期的磁碟 volume。適合文件轉換、批次作業或其他中間產物，不是永久儲存。

**先做什麼：** 測試容量、效能、費用及 instance 結束後的資料處理。需要持久化的成果應另存 Cloud Storage 或資料庫。

[Cloud Run 發布紀錄](https://docs.cloud.google.com/run/docs/release-notes)

## 11｜OpenAI：GPT-6 Cyber

**11/05 發布**

API changelog 新增 `gpt-6-cyber`，用途包括漏洞調查、在已授權測試環境重現問題，以及驗證修補。首次使用前需閱讀 Daybreak 設定與存取要求。

**先做什麼：** 先確認資格與授權範圍，再用隔離測試環境評估結果。模型產出不能取代人工驗證，也不應直接對未授權系統執行測試。

[OpenAI API Changelog](https://developers.openai.com/api/docs/changelog)

## 12｜Codex CLI 0.167.0：Agent Command Center

**11/06 發布**

新增 `codex agents --no-daemon`，可在 command center 與 session picker 辨識未讀結果、切換 backend，並在支援的終端機預覽本機圖片。實驗性的 `gcp_setup_wizard` 協助設定 Vertex AI 的 ADC 或憑證檔案。

**先做什麼：** 測試多 backend 切換、對話恢復與認證權限。這是 CLI 版本更新，不代表每項功能都已同步到桌面 App。

[0.167.0 release](https://github.com/openai/codex/releases/tag/rust-v0.167.0)

## 13｜Gemini CLI 0.67.0：MCP 權限與 Sandbox 修正

**11/04 發布**

新增 `models` 指令與 `--list-models`，改善容器 sandbox 的 IDE companion 連線，修正唯讀檔案／hard link 寫入處理，以及非互動模式取消後仍繼續執行工具的問題。ACP 權限請求現在包含 MCP server 與 tool metadata。

**先做什麼：** 測試檔案保護、取消行為和 MCP 授權畫面，尤其是把 CLI 接入自動化的流程。

[v0.67.0 release](https://github.com/google-gemini/gemini-cli/releases/tag/v0.67.0)

## 14｜Copilot Code Review：API 管理與來源追蹤

**11/06 發布**

REST／GraphQL API 擴充到企業、組織與 repository 的 code review 設定，並能辨識 Copilot review／comment、review effort，以及回報的 skills、MCP、自訂指令來源。不同管理層級的權限不同；企業與組織設定端點尚不支援 GitHub App 或 fine-grained PAT。

**先做什麼：** 用測試 repository 比較審查品質、誤報與人工修改時間，再決定是否擴大使用。來源資訊是可追蹤線索，不是結果正確性的保證。

[GitHub 官方公告](https://github.blog/changelog/2026-11-06-copilot-code-review-api-management-and-review-overview-updates/)

## 15｜Dependabot：支援 Agent Package Manager

**11/03 發布**

Dependabot 可更新 `apm.yml` 中受支援的 git 相依項目，並在存在時重建 `apm.lock.yaml`，將 skills、prompts、instructions 的版本更新納入 PR。這次支援的是版本更新，**不包含安全漏洞更新**。

**先做什麼：** 有使用 APM 才需要新增對應設定；先驗證 lockfile 與審核流程，勿把自動更新 PR 視為相依內容已通過安全審查。

[GitHub 官方公告](https://github.blog/changelog/2026-11-03-dependabot-version-updates-support-agent-package-manager/)

## 16｜Pydantic 2.14.3：Serialization 與相容性修正

**版本日期 11/04；GitHub release 顯示 11/05**

修正序列資料逐索引使用 `include`／`exclude` 時的平方級 serialization 時間，並改善 schema generation 與序列化效能。GraalPy wheel 也有調整：不再發布 3.11 wheel，改提供 3.13，並保留既有 3.12。

**先做什麼：** 用代表性的巢狀資料與大型 API response 跑 benchmark，核對驗證結果與 JSON Schema。效能改善需以實際資料量測，不能直接當作所有 API 都會加速。

[v2.14.3 release](https://github.com/pydantic/pydantic/releases/tag/v2.14.3)

## 17｜Angular 22.2.5：Forms、Router 與 Resource

**11/06 發布**

`rxResource` 新增 `debugName`；自訂 `FormValueControl` 改善 `updateOn: blur`／`submit`，修正 required validator 對應與 router 的 `focusReset` 處理。圖片、影片的 `src` 為 null／undefined 時，也調整屬性移除行為。

**先做什麼：** Angular 22 專案應測試表單控制項、導航焦點及 resource 行為。舊 major 版本仍需依完整升級指南處理，不宜只為這次 patch 跨版升級。

[v22.2.5 release](https://github.com/angular/angular/releases/tag/v22.2.5)

## 18｜Secret Scanning：新增偵測器、減少誤報

**11/05 發布**

GitHub 新增 Starlink API secret 偵測，SpaceX 加入合作夥伴計畫。Google Cloud Storage、AWS、Alibaba、OpenVSX、Pydantic Logfire、Tencent 等偵測器改善誤報過濾；這不代表涵蓋所有雲端憑證。

**先做什麼：** 確認適用的 Secret Scanning 與 Push Protection 設定，追查尚未處理的外洩告警。正式憑證仍應放在 secret manager，已外洩的金鑰需撤銷或輪替。

[GitHub 官方公告](https://github.blog/changelog/2026-11-05-secret-scanning-upgrades-detectors-adds-spacex-as-partner/)

## 19｜Copilot Usage API：區分 BYOK 與企業自訂模型

**11/03 公告**

用量報表可分開辨識本機 BYOK、企業自訂模型與 Copilot 託管模型。本機 BYOK 資料依賴 client telemetry，停用遙測或 provider 不回報 token 時會低估；企業自訂模型為伺服器側統計，沒有相同限制。

**先做什麼：** 整合成本報表時標明資料缺口，避免把未回報用量當成零，也不要把不同付費來源混在一起比較。

[GitHub 官方公告](https://github.blog/changelog/2026-11-04-byok-and-enterprise-custom-models-in-the-copilot-usage-api/)

## 20｜GPT-Image-2.6：SVG 與動畫 GIF

**11/04 發布**

`gpt-image-2.6-sunburst`、`gpt-image-2.6-flare` 支援圖片生成／編輯、可調整 complexity，以及 SVG、動畫 GIF 生成。受支援的 GPT-Image-2.5／2.6 模型也擴充 markup-guided editing。

**先做什麼：** 比較文字正確率、SVG 可編輯性、GIF 穩定性、生成時間與成本。將產物放進網頁前仍需檢查格式與內容，不直接信任生成的標記。

[OpenAI API Changelog](https://developers.openai.com/api/docs/changelog)

## 後續追蹤

先處理有截止日的 GitHub Actions 政策與授權變更，再安排 SDK／CLI 相容性測試。Agent Registry、IP allowlist、AI code review 則適合先用小型測試專案驗證，不必一次全面導入。

本期另追蹤 FastAPI、Gemini API、MCP／A2A 與 RAG／evaluation，原週報未選出額外獨立消息；這不表示這些專案完全沒有更新。Cloud Run 的 Python 3.15 runtime 已於 11/02 進入 Preview，但不代表既有 Python 服務需要立即升級。

## 到期與生效日期

以下包含先前已公告的時程，並非全是本週新消息。日期狀態以 11/13 複核為準。

| 日期 | 項目 | 檢查方向 |
| --- | --- | --- |
| 11/10 00:00–02:00（台灣，已過） | GitHub Actions 第一次短暫封鎖測試 | 查看失敗紀錄 |
| 11/17 00:00–02:00（台灣） | GitHub Actions 第二次短暫封鎖測試 | 確認 trigger 與必要例外 |
| 11/28 | Angular 20 LTS 結束 | 規劃受支援版本遷移 |
| 11/30 | Claude Sonnet 4.5 在 Claude API 退役 | 查找舊 model ID |
| 11/30 | Claude Opus 4.8 fast mode 移除 | 檢查 `speed: "fast"`，不等同整個模型退役 |
| 12/02 | GitHub Actions 新政策生效 | 完成公開 workflow 相容性檢查 |
| 2027/03/31 | Gemini Enterprise 既有綁定 Code Assist 權益結束 | 核對授權來源與替代方案 |

來源：[Angular 支援時程](https://angular.dev/reference/releases)、[Claude 發布紀錄](https://platform.claude.com/docs/en/release-notes/overview)，以及第 01、02 則官方公告。
