---
title: "技術週報｜2026-11-16"
date: 2026-11-16
author: "AI 協助整理"
description: "18 則更新：FastAPI、Angular、GitHub 政策、Claude Code、Gemini CLI、GCP 與 AI Agent 安全架構。"
categories:
  - 技術雷達
tags:
  - AI
  - CI/CD
  - DevOps
  - GCP
  - Python
---

2026/11/09–11/15 的 18 則工程與 AI 開發更新，於 11/16 依官方來源複核。4 項 P0 是需優先確認的相容性、EOL 與監控政策，不代表全部都是安全漏洞；另有 11 項 P1 與 3 項 P2。

日期採**官方來源標示日期**，GitHub Release 的 UTC 日期換算台灣時間可能是隔日。以下是通用、條件式影響分析，未檢查任何特定企業資產。

<!-- more -->

## P0｜優先確認風險與 Breaking Changes

### 01｜Dependabot：12/8 起暫停部分閒置專案告警

**11/10 公告；12/08 生效**

過去一年無活動的多數 repository 將暫停 Dependabot Alerts，既有告警封存而非刪除，推送 commit 或重新啟用可恢復。強制安全設定及部分 Enterprise Policy 有例外；GitHub Enterprise Server 不在本次範圍。

**影響與行動：** 仍部署但很少修改的專案可能失去持續告警。盤點這類服務，建立適用的強制政策或獨立 dependency scan，不依賴無實質內容的 commit 維持監控。

[官方公告](https://github.blog/changelog/2026-11-10-dependabot-alerts-will-pause-on-inactive-repositories/)

### 02｜Copilot：六款模型 12/14 停用

**11/13 公告；12/14 生效**

| 停用模型 | 建議替代 |
| --- | --- |
| Claude Fable 5 | Claude Fable 5.2 |
| Claude Haiku 4.5 | Claude Haiku 5.5 |
| Gemini 3.8 Flash | Gemini 4 Hydrogen |
| Gemini 4 Argon | Gemini 4 Carbon |
| Grok 4.6 | Grok 4.7 |
| Kimi K3 | 尚未公告 |

Haiku 4.5 部分個人年度方案有例外。這是 **Copilot 平台**的停用，不等於原生模型 API 全部停用。

**影響與行動：** 檢查模型政策、Agent 與 IDE 固定模型設定；用相同開發任務比較替代模型的測試通過率、人工修正時間與成本。

[官方公告](https://github.blog/changelog/2026-11-13-upcoming-deprecation-of-selected-github-copilot-models-in-december/)

### 03｜GitHub Actions：ARM32 Hosted Runner 支援結束

**11/12 公告；12/08 生效**

Windows／Linux Hosted Runner 將不再支援原生 ARM32（AArch32）userspace 工作負載，與 Node.js 20 EOL、Node.js 24 不支援 ARM32 有關。一般 AMD64／ARM64 CI 並非主要對象。

**影響與行動：** 搜尋 workflow 的 `armv7`、`armhf`、`linux/arm/v7` 與 AArch32；按實際需求遷移至 ARM64、AMD64 或自行管理的相容 runner。

[官方公告](https://github.blog/changelog/2026-11-12-actions-for-arm32-linux-windows-retirement/)

### 04｜FastAPI 0.162.6：停止支援 Python 3.10

**11/13 發布；Breaking Change**

0.162.6 移除 Python 3.10 支援。同週 0.162.3 新增 Python 3.15 支援，0.162.7 修正請求取消時非同步 `yield` dependency 清理。既有已部署舊版不會因公告立即停止。

**影響與行動：** 盤點 Python runtime；尚不能升級的 3.10 專案暫時鎖定相依版本，同時規劃遷移。測試 Pydantic、資料庫 driver、Uvicorn、Docker image 與 CI。

[FastAPI 發布紀錄](https://fastapi.tiangolo.com/release-notes/)

## P1｜優先評估的更新

### 05｜Angular Hybrid：@angular/upgrade XSS 公告

**11/09｜GHSA-ffj9-42qx-f38h｜CVSS 4.0：6.3**

Angular／AngularJS 混合應用使用 `downgradeComponent()`，在特定 DOM binding 條件下可能將不可信內容當作 AngularJS template 執行。修補版為 **22.2.4、21.2.26、20.3.35**；19.2.25 以下已 EOL 分支無修補。純 Angular 應用不受這項漏洞影響。

**影響與行動：** 搜尋 `@angular/upgrade`、`downgradeComponent`、`ng-bind-html`，升級適用專案並檢查使用者輸入是否進入 template 路徑。

[Angular 安全公告](https://github.com/angular/angular/security/advisories/GHSA-ffj9-42qx-f38h)

### 06｜Claude Code：OAuth、Sandbox、zstd 安全修正

**v2.1.321–v2.1.325｜11/09–11/13 UTC 發布日期**

2.1.321 修正 MCP OAuth redirect 可能把 refresh token 傳至其他 host、部分唯讀 Bash 指令繞過 sandbox 授權提示及檔案寫入檢查問題；2.1.325 修正 zstd 解碼安全問題並改善 subagent、session 恢復與權限行為。

**影響與行動：** 優先更新使用 MCP／Shell 的開發環境，驗證 OAuth、sandbox、worktree 與自動 session。官方未公開所有嚴重程度，不推定全部可遠端利用。

來源：[2.1.321](https://github.com/anthropics/claude-code/releases/tag/v2.1.321)、[2.1.325](https://github.com/anthropics/claude-code/releases/tag/v2.1.325)。

### 07｜FastAPI 0.163：Dependency Concurrency

**0.163.0：11/14；0.163.1：11/15**

新增 `Depends(max_concurrency=...)` 限制 dependency 執行並行度；0.163.1 修正巢狀 computed field response model 的 OpenAPI schema。

**影響與行動：** 可評估外部 AI API、資料庫等有限容量 dependency 的負載控制。比較 P95、吞吐、排隊與錯誤率。這不是跨 instance 的分散式全域 rate limiter，不能直接替代整體配額管理。

[FastAPI 發布紀錄](https://fastapi.tiangolo.com/release-notes/)

### 08｜Cloud Run：容器漏洞與 Secret 檢測

**11/09｜Vulnerability Assessment Preview**

掃描 Cloud Run services、jobs、worker pools 所用映像中的漏洞與暴露 secret。

**影響與行動：** 先以非正式環境映像驗證掃描結果、區域、IAM、費用及與 Artifact Registry／既有 CI 掃描的重疊。Preview 不應作為唯一安全防線。

[Cloud Run 發布紀錄](https://docs.cloud.google.com/run/docs/release-notes/)

### 09｜API Keys Remote MCP Server GA

**11/12｜Google Cloud**

Agent 可透過 MCP 建立、檢視、限制與管理 project API key。這提高雲端自動化能力，也引入憑證生命週期操作風險。

**影響與行動：** 先測唯讀盤點；建立、改限制及刪除採獨立 service account、最小 IAM 與明確核准，不讓模型自行擴張正式環境憑證權限。

[Google Cloud 發布紀錄](https://docs.cloud.google.com/release-notes)

### 10｜GitHub：Actions Workflow Log Secret Scanning

**11/09｜Public Preview**

執行完成後掃描 provider secret，結果顯示在 repository alerts。需適用 Enterprise Cloud、Secret Protection／Advanced Security 授權；不回溯舊 log，不偵測已遮罩、generic／custom／AI-detected 類型，Preview 不主動通知。

**影響與行動：** 在測試 repository 驗證資格與結果並分派定期檢視責任。這增加偵測層，不取代 masking、push protection 與憑證輪替。

[官方公告](https://github.blog/changelog/2026-11-09-secret-scanning-detects-secrets-in-github-actions-workflow-logs/)

### 11｜Gemini CLI v0.68.0

**11/10 UTC｜Stable**

新增 extension validation command、安裝鎖定、HTTP 429 冷卻倒數，改善模型選擇狀態、SubagentStop hook 與 rootless Podman sandbox。

**影響與行動：** 使用 extension、MCP 或程式碼自動化的環境，先驗證自訂 hook、安裝流程及 sandbox；確認升級沒有改變既有工具授權邊界。

[官方 Release](https://github.com/google-gemini/gemini-cli/releases/tag/v0.68.0)

### 12｜GitHub AI Scan：REST API 管理

**11/13｜Public Preview**

新增組織／repository 層級 `repository_scan` 設定。啟用不會自動掃描，仍需有寫入權限的使用者啟動；**每次掃描會消耗 Code Security AI Credits**，GitHub Enterprise Server 不在範圍。

**影響與行動：** 多專案團隊可統一管理開關，但應先在測試專案驗證權限、結果與成本，再評估納入 IaC。

[官方公告](https://github.blog/changelog/2026-11-13-manage-ai-scan-for-repositories-using-the-rest-api/)

### 13｜Gemini Enterprise Agent Platform：跨 Project 治理

**11/10**

Resource Manager management boundary 的 `AGENT_MANAGEMENT` 讓中央 Agent Registry 發現成員 project agent、保留 runtime identity，再以共用 Agent Gateway 與 Policy Engine 套用語意治理政策。

**影響與行動：** 適合評估多 project agent 架構；先以兩個測試 project 驗證 discovery、IAM、跨專案政策與 audit log，並確認區域與費用。

[官方發布紀錄](https://docs.cloud.google.com/gemini-enterprise-agent-platform/release-notes)

### 14｜Model Armor：v4 Latest Filter 更新

**11/12**

改善間接 prompt injection、tool call、多輪對話攻擊偵測與部分誤報。

**影響與行動：** 使用 RAG 文件或 MCP tool response 的 agent，可建立正常／惡意輸入及敏感資料測試集，量測偵測率與誤報。使用自動更新的 `Latest` alias 時持續監測漂移，不能把過濾器當作授權控制替代品。

[官方發布紀錄](https://docs.cloud.google.com/model-armor/release-notes)

### 15｜Copilot：Gemini 4 Carbon／Hydrogen

**Carbon：11/10；Hydrogen：11/13｜GA，逐步推出**

Carbon 定位複雜 coding、推理與安全相關工作；Hydrogen 定位快速 agentic coding、工具使用與多步驟任務。採 usage-based billing，方案與 policy 決定可用性；Carbon 不包含 Pro，Hydrogen 包含 Pro。

**影響與行動：** 用相同 refactoring、測試產生與小型修改工作比較完成率、人工修正及成本。Copilot 能力不等於所有原生 Gemini API 接入方式完全相同。

來源：[Carbon](https://github.blog/changelog/2026-11-10-gemini-4-carbon-in-github-copilot/)、[Hydrogen](https://github.blog/changelog/2026-11-13-gemini-4-hydrogen-in-github-copilot/)。

## P2｜架構與實驗能力

### 16｜Claude Code：實驗性 Code Mode

**v2.1.323｜11/12 UTC**

模型可透過撰寫 JavaScript 協調工具。Plugin 亦可指定 Claude Code 版本範圍，validation 增加 TypeScript hook 檢查。

**影響與行動：** 在隔離環境比較 code mode 與一般 tool calling 的權限、可觀測性、錯誤處理與工具可靠性，暫不作為正式自動化唯一執行模式。

[官方 Release](https://github.com/anthropics/claude-code/releases/tag/v2.1.323)

### 17｜Cloud Run：Ambient Networking／Express Links

**11/13｜Preview**

平台管理的每 instance Envoy sidecar 提供部分流量、安全與可觀測性能力；Express Links 簡化服務間連線。

**影響與行動：** 多個 API、agent、MCP service 可評估是否減少自行管理連線驗證的負擔。先以兩個測試服務量測 authentication、延遲、trace、網路政策與費用，與 IAM token + HTTPS 比較。

[Cloud Run 發布紀錄](https://docs.cloud.google.com/run/docs/release-notes/)

### 18｜OpenAI：Persistent Agent 安全部署架構

**11/12｜工程文章，非新 API Release**

重點是可信 control plane／不可信 runtime 分離、sandbox 網路與檔案限制、動作 auto-review、agent identity 與使用者身分區分，以及完整行為紀錄。

**影響與行動：** 轉為 Agent Security Checklist：憑證經 broker 而非直接暴露 runtime，阻擋非必要 metadata endpoint 存取，外部寫入有明確核准，保留可稽核紀錄。

[OpenAI 工程文章](https://developers.openai.com/blog/securing-persistent-agents-like-openclaw-at-openai)

## 本週工程待辦

| 優先級 | 工作 | 可驗證產出 |
| --- | --- | --- |
| P0 | Python 3.10／FastAPI 盤點 | Runtime 遷移與相容性清單 |
| P0 | 閒置 repository、Copilot、ARM32 | 監控覆蓋與 EOL 遷移清單 |
| P1 | Claude Code、Angular Hybrid | 升級及適用條件測試 |
| P1 | Cloud Run 掃描、FastAPI concurrency | 安全與壓力測試結果 |
| P1 | Agent 跨 project 治理 | IAM／policy／audit PoC |
| P2 | Persistent Agent 隔離 | 安全邊界與核准檢查表 |

## 重要期限延續追蹤

- **11/28：** [Angular 20 LTS 結束](https://angular.dev/reference/releases)。
- **11/30：** [Claude Sonnet 4.5 API 停用](https://platform.claude.com/docs/en/about-claude/model-deprecations)、[Opus 4.8 Fast Mode 移除](https://platform.claude.com/docs/en/release-notes/overview)。
- **12/02：** 公開 repository 的 [`pull_request_target` 預設政策變更](https://github.blog/changelog/2026-11-02-pull_request_target-blocked-by-default-december-2/)。下一次短暫強制測試為**台灣時間 11/17 00:00–02:00**。
- **12/08：** Dependabot 閒置專案與 ARM32 政策生效。
- **12/14：** 六款 Copilot 模型停用，按方案例外安排。

## 範圍與結論

Pydantic Core、TypeScript、Docker Engine、OpenAI Core API、Claude Platform API、RAG／Evaluation framework 與 A2A 本期未另闢專節，這是選題範圍，**不表示沒有新公告**。FastAPI 0.163.1 與 Gemini CLI 小修正已合併，避免湊數。

先完成 Python／FastAPI 相容性與 GitHub 監控／EOL 盤點，再投入 Cloud Run 掃描、Agent Registry／MCP 治理及 concurrency PoC。新能力的價值應以測試與成本確認，而不是直接把 Preview 或實驗功能當成正式環境依賴。
