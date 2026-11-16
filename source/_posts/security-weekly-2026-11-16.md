---
title: "資安週報｜2026/11/16"
date: 2026-11-16
author: "AI 協助整理"
description: "14 個主題：Chrome、Outlook、OpenSSH、PostgreSQL、Ubuntu Kernel、GCP、MCP、Apache、AWS、GitHub 與 NGINX。"
categories:
  - 資安週報
tags:
  - Linux
  - Ubuntu
  - 雲端安全
  - AI
  - GitHub Actions
---

本期涵蓋 2026/11/09–11/15 的 14 個主題與平台追蹤，於 11/16 依官方來源重新核對。優先處理已遭利用的 Chrome、Outlook 與特定 OpenSSH 環境，再安排 PostgreSQL、核心與 MCP 元件更新。

以下日期採**原始公告標示日期**；AWS 公告使用 PST，換算台灣時間可能是隔日。優先級與影響均為條件式評估，不代表任何個別資產已受影響或完成修補。

<!-- more -->

## 緊急處理 P0

### 01｜Chrome：XML Zero-day 已遭利用

**CVE-2026-125350｜11/09 修補、11/10 列入 KEV**

XML 元件的 use-after-free 可由特製網頁觸發。Google 確認已有實際利用；11/11 的新版另修補 83 項安全問題，但不能把全部新增漏洞都視為已遭利用。

| 平台 | 最初修補版本 | 本期較新 Stable |
| --- | --- | --- |
| Windows／macOS | 157.0.8103.50／.51 | 157.0.8103.78／.79 |
| Linux | 157.0.8103.50 | 157.0.8103.78 |

**建議：** 更新並重新啟動瀏覽器；其他 Chromium 瀏覽器須依各廠商公告核對，不直接套用 Chrome 版號。

來源：[11/09 Chrome 公告](https://chromereleases.googleblog.com/2026/11/stable-channel-update-for-desktop_018223192.html)、[11/11 Chrome 公告](https://chromereleases.googleblog.com/2026/11/stable-channel-update-for-desktop_01744469280.html)。

### 02｜Outlook：已遭利用的 Spoofing 漏洞

**CVE-2026-124194｜11/10｜Microsoft CVSS 3.1：6.5**

此問題涉及認證資訊暴露風險，須使用者互動；**預覽窗格不是攻擊途徑**。受影響 Office／Outlook 版本及適用更新應依 MSRC 清單判斷，不能只依應用程式名稱推定全部版本都受影響。

**建議：** 優先安裝對應 Office 安全更新，依環境政策限制不必要的對外 NTLM 認證，並檢查異常對外 SMB／認證連線。本期不把未完整核對的攻擊細節當作已證實事實。

來源：[MSRC](https://msrc.microsoft.com/security-guidance/advisory/CVE-2026-124194)、[NVD／KEV 記錄](https://nvd.nist.gov/vuln/detail/CVE-2026-124194)。

### 03｜OpenSSH：特定 Alpine／musl 環境驗證繞過

**CVE-2026-123158｜11/09 加入 KEV｜Amazon Linux 評分 9.8；Ubuntu 頁面評分 8.1**

主要條件是 musl libc、未啟用 PAM、受影響版本，以及特定帳號密碼欄位與驗證設定。不是所有 Linux OpenSSH 都受影響；Ubuntu 官方列為不受影響。Alpine 容器若執行 SSH Server，仍應獨立盤點。

**修補：** OpenSSH 10.6p2 或發行版已修補套件，更新後重啟 sshd。無法立即更新時可停用 SSH 密碼驗證，但須先確保替代登入方式可用。

來源：[Alpine](https://alpinelinux.org/posts/2026-11-05-openssh-password-authentication-bypass/)、[Ubuntu](https://ubuntu.com/security/CVE-2026-123158)、[Amazon Linux](https://explore.alas.aws.amazon.com/CVE-2026-123158.html)、[CISA](https://content.govdelivery.com/accounts/USDHSCISA/bulletins/4323900)。

## 本週處理 P1

### 04｜PostgreSQL：52 項安全修補與 14 版 EOL

**11/12 安全更新**

官方修補 52 項安全問題與超過 140 項錯誤。部分漏洞在特定資料庫權限條件下可能導致程式碼執行，不應一概稱為未驗證遠端 RCE；本期未確認野外利用。

| 分支 | 本期安全版本 |
| --- | --- |
| 18 | 18.7 |
| 17 | 17.12 |
| 16 | 16.16 |
| 15 | 15.20 |
| 14 | 14.25，最後安全版本，已 EOL |

Debian 12 的 PostgreSQL 15 修補套件為 `15.20-0+deb12u1`。本次亦有條件式 `REINDEX` 需求；使用增量備份者應依官方指引重新建立完整備份基礎。

**建議：** 同時驗證 Extension、備份還原、應用相容性及索引維護，並把 14 版主版本升級列入計畫。完整 CVE 與個別前提以官方清單為準。

來源：[PostgreSQL 發布公告](https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released-3442/)、[Debian DLA-4905-1](https://security-tracker.debian.org/tracker/DLA-4905-1)。

### 05｜Ubuntu Kernel：linux-gcp 修補狀態更新

**CVE-2026-98432｜11/14 頁面更新｜CVSS 3.1：9.8**

延續追蹤 Linux IPv4 TCP 記憶體安全問題。各核心 flavor 必須分別確認；以下僅是 `linux-gcp`，不能套用到 generic、HWE、FIPS。

| Ubuntu | linux-gcp 修補版本／狀態 |
| --- | --- |
| 26.10 | 7.3.0-1004.4 |
| 26.04 LTS | 7.0.0-1017.19 |
| 24.04 LTS | 6.8.0-1073.81 |
| 22.04 LTS | 5.15.0-1121.131 |
| 20.04 LTS | 此 flavor 仍標示 Vulnerable |
| 18.04／16.04 等 | 依 flavor 與維護資格逐一確認 |

**建議：** 安裝修補後安排重啟，並以 `uname -r` 確認正在執行的新核心。APT 沒有待更新套件不等於執行中的核心已更新。本期未確認實際利用。

來源：[Ubuntu CVE 狀態](https://ubuntu.com/security/CVE-2026-98432)。

### 06｜GCP：AMD EPYC 資料洩漏風險

**GCP-2026-081｜11/10｜CVE-2024-36350、CVE-2024-36357、CVE-2026-0004**

涉及 C4D、N4D、H4D、Z4D、G4 及特定 Bare Metal 機型。Google 已提供跨 VM／Host 緩解；VM 內程序間防護仍需更新 Guest OS。

**建議：** 依官方指引確認 CPU 資訊更新已送達 VM 後，再安排 Stop／Start；單純 Guest OS Reboot 不足夠。先檢查 IP、磁碟與服務依賴及停機影響。Cloud Run 不需採取此項動作。公告未列統一 CVSS，本期未確認實際利用。

來源：[GCP 安全公告](https://docs.cloud.google.com/support/bulletins/index#gcp-2026-081)。

### 07｜MCP Gateway Registry：權限提升與 SSRF

**11/11 揭露，不等同修補發布日**

| CVE | 問題 | 受影響版本 | 修補版本 |
| --- | --- | --- | --- |
| CVE-2026-100307 | 管理 API 授權不足 | 1.0.9–1.24.7 | 1.25.0 |
| CVE-2026-125926 | Server Registration SSRF | 1.0.3–1.34.0 | 1.35.0 |

1.25.0 早於 6/27 發布，不能稱為本週才釋出。**建議至少採用 1.35.0 或更新版本**，並檢查既有權限對應、已註冊 upstream URL、日誌與憑證：更新不會自動清除過去寫入的惡意權限，也不會重新驗證所有既有 URL。公告未列 CVSS，本期未確認野外利用。

來源：[權限提升公告](https://aws.amazon.com/security/security-bulletins/2026-179-aws/)、[SSRF 公告](https://aws.amazon.com/security/security-bulletins/2026-180-aws/)。

### 08｜AWS API MCP Server：安全策略繞過

**CVE-2026-125271｜11/10**

Operation Name 正規化錯誤可能使特定連續大寫字母操作未匹配 `denyList`／`elicitList`。影響 `awslabs.aws-api-mcp-server >=0.2.13,<1.5.1`，修補版為 **1.5.1**。

**建議：** 更新並測試禁止與要求確認的操作是否確實被攔截；官方沒有替代 workaround。尤其能操作 IAM、儲存或部署的 Agent 應優先處理。公告未列 CVSS，本期未確認實際利用。

來源：[AWS 公告](https://aws.amazon.com/security/security-bulletins/2026-176-aws/)。

### 09｜Ubuntu／Debian：Apache HTTP Server 更新

**11/12｜USN-9090-1、DSA-6620-1**

包含 CVE-2026-42528、CVE-2026-109163、CVE-2026-106023、CVE-2026-119618、CVE-2026-42356，涉及 DoS、記憶體毀損與特定條件下的程式碼執行。

| Ubuntu | apache2 修補版本 |
| --- | --- |
| 26.10 | 2.4.68-1ubuntu6.2 |
| 26.04 LTS | 2.4.66-2ubuntu2.8 |
| 24.04 LTS | 2.4.58-1ubuntu8.19 |
| 22.04 LTS | 2.4.52-1ubuntu4.27 |
| 20.04 LTS | 2.4.41-4ubuntu3.23+esm11 |
| 18.04 LTS | 2.4.29-1ubuntu4.27+esm15 |
| 16.04／14.04 | 依 USN 對應 ESM 套件 |

**建議：** 先確認是否安裝及啟用 Apache，再安排更新；20.04 及較舊版本須核對 Ubuntu Pro／ESM 資格。本期未確認實際利用。

來源：[Ubuntu USN](https://ubuntu.com/security/notices/USN-9090-1)、[Debian DSA](https://lists.debian.org/debian-security-announce/2026/msg00540.html)。

### 10｜AWS SDK for pandas：EMR Log Bucket 風險

**CVE-2026-127119｜11/12**

`awswrangler >=1.1.0,<3.18.0` 在未指定 EMR Log S3 Bucket 時使用可預測名稱且未驗證擁有者，攻擊者搶先建立 bucket 可能取得工作日誌。修補版為 **3.18.0**。

**建議：** 升級或明確指定自己帳號持有的 log bucket，檢查既有日誌位置。新版預設 bucket 擁有者驗證需要 `s3:ListBucket`，應一併檢查 IAM。公告未列 CVSS，本期未確認實際利用。

來源：[AWS 公告](https://aws.amazon.com/security/security-bulletins/2026-181-aws/)。

## 持續觀察 P2

### 11｜GitHub Secret Scanning：Actions Log 掃描

**11/09 Public Preview；11/12 新增 Cloudflare detector**

符合 Enterprise Cloud 與 Secret Protection／Advanced Security 授權的環境，可啟用 workflow log 掃描。Preview 不回掃歷史執行紀錄，也不主動通知這類告警，需查看 Secret Scanning Alerts。

**建議：** 驗證資格並建立告警檢視責任；不要取代既有遮罩與憑證管理。這是防護能力更新，不是 GitHub 外洩事件。

來源：[Actions Log 掃描](https://github.blog/changelog/2026-11-09-secret-scanning-detects-secrets-in-github-actions-workflow-logs/)、[Cloudflare detector](https://github.blog/changelog/2026-11-12-secret-scanning-adds-a-detector-for-cloudflare/)。

### 12｜Dependabot：閒置專案告警政策變更

**11/10 公告；12/08 起生效**

多數超過一年無活動的 repository 將暫停 Dependabot Alerts；既有告警封存而非刪除，可恢復。強制安全設定及部分企業政策有例外。

**建議：** 盤點仍部署但長期不更新的專案，確保持續有相依套件掃描，而非用無實質內容的 commit 維持監控。

來源：[GitHub 公告](https://github.blog/changelog/2026-11-10-dependabot-alerts-will-pause-on-inactive-repositories/)。

### 13｜Kiro CLI：對話與 Prompt History 權限過寬

**CVE-2026-124848｜11/10**

macOS／Linux 的 Kiro CLI `>=1.16.0,<2.27.0` 可能讓其他本機使用者讀取 session transcript 與 prompt history。更新至 **2.27.0**，並至少啟動一次新版 CLI 以限制既有 session 權限；舊 Amazon Q CLI history 可能需額外處理。

**建議：** 共用開發主機提高至 P1，檢查是否曾包含憑證。公告未列 CVSS，本期未確認實際利用。

來源：[AWS 公告](https://aws.amazon.com/security/security-bulletins/2026-178-aws/)。

### 14｜NGINX：Debian 12 前期漏洞延續追蹤

**CVE-2026-15176｜非本週新漏洞**

截至本期查核，Bookworm Security `1.22.1-9+deb12u10` 仍標示 vulnerable；Debian 13 `1.26.3-3+deb13u10` 已 fixed。Ubuntu 22.04 先前已提供 `1.18.0-6ubuntu14.22`。

**建議：** 對照實際套件及 `alias`、`rewrite`、`$request_filename` 等特定組合；不是出現任何 `alias` 就一定可利用。無可升級套件也不能直接等同所有漏洞已解決。

來源：[Debian Tracker](https://security-tracker.debian.org/tracker/CVE-2026-15176)、[Ubuntu USN-8955-1](https://ubuntu.com/security/notices/USN-8955-1)。

## 其他平台追蹤

Docker、Figma、OpenAI、Anthropic、Gemini 與 Azure 仍列入追蹤；本期未另列可充分核對的重大新事件，**不代表沒有漏洞或保證安全**。Docker Desktop 前期 token log 問題仍應依[官方安全公告](https://docs.docker.com/security/security-announcements/)追蹤。Java／Maven 環境應查閱 [Debian 安全公告](https://www.debian.org/security/)中的 Tomcat 更新，按實際依賴判斷，不能推定所有 Java 專案受影響。AI 參與漏洞研究不等於模型供應商自身發生事件。

## 通用唯讀檢查與本週待辦

適用 Debian／Ubuntu 管理者的唯讀盤點範例，不表示任何特定使用者部署了下列服務：

```bash
cat /etc/os-release
uname -r
apt-cache policy nginx nginx-core linux-image-gcp linux-gcp apache2 postgresql-15
pg_lsclusters 2>/dev/null
apt list --upgradable 2>/dev/null
```

Debian／Ubuntu 使用 backport，必須核對**完整套件版本、發行版狀態與執行中的服務／核心**，不可只比較上游版號。自動更新日誌可佐證流程，不能替代修補驗證。

1. **P0：** 更新 Chrome、Outlook；盤點適用的 Alpine SSH Server。
2. **P1：** 更新 PostgreSQL 並確認備份／索引；驗證 Ubuntu Kernel；依 GCP 公告安排必要 Stop／Start。
3. **P1：** 更新 MCP Gateway、AWS API MCP Server，審查存量權限與 URL；按使用情形處理 Apache、Tomcat、awswrangler。
4. **P2：** 建立 GitHub 掃描告警檢視、盤點閒置 repository、處理 Kiro 本機歷史權限，持續追蹤 Debian 12 NGINX。

本期重點不只是更新版本，也包括更新後的狀態驗證與既有資料清查。Agent 工具清單限制不能取代授權、URL 驗證與雲端 IAM 邊界。
