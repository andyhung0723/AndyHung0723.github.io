---
title: "資安週報｜2026/11/09"
date: 2026-11-09
author: "AI 協助整理"
description: "14 個主題：APT、WordPress、SonicWall、Linux Kernel、憑證信任庫、NGINX、Chrome、AWS、Python、Debian 與 PostgreSQL。"
categories:
  - 資安週報
tags:
  - Linux
  - Ubuntu
  - 開發工具
  - 雲端安全
---

整理 2026/11/02–11/08 的 14 個資安主題與其他平台追蹤結果。11/13 重新核對官方來源，修正 Chrome 修補數量，補上 PostgreSQL 14 的最新版本資訊。

優先確認 APT 修補；使用 WordPress 或 SonicWall 的環境，應先處理已知遭利用的漏洞。以下是通用盤點建議，不代表任何個別系統已受影響或已完成修補。

<!-- more -->

## 1. APT：下載驗證繞過，可取得 root 權限

**CVE-2026-109518｜11/04｜Canonical：High，CVSS 4.0 7.7**

能操縱套件下載 HTTP 流量的攻擊者，可利用重新導向、下載重試與 hard link 處理缺陷，使 APT 安裝未驗證的套件。Debian 12、Ubuntu 22.04 起預設啟用下載重試；舊版也須檢查 `Acquire::Retries` 是否非零。

| 系統 | APT 修補版本 |
| --- | --- |
| Debian 12 | `2.6.2` |
| Debian 13 | `3.0.4` |
| Ubuntu 22.04 | `2.4.15ubuntu0.1` |
| Ubuntu 24.04 | `2.8.4ubuntu0.1` |
| Ubuntu 26.04 | `3.2.1ubuntu0.1` |
| Ubuntu 26.10 | `3.3.3ubuntu0.1` |

Ubuntu 20.04 及更舊版本的修補取得方式涉及 Ubuntu Pro／Legacy，須對照公告。先確認已安裝版本，再依維護流程更新。HTTPS 可保護這條下載路徑，但不應取代正式修補。本次未確認野外利用。

來源：[Canonical 說明](https://ubuntu.com/blog/apt-vulnerability-fixes-available)、[USN-8996-1](https://ubuntu.com/security/notices/USN-8996-1)、[Debian Tracker](https://security-tracker.debian.org/tracker/CVE-2026-109518)。

## 2. WordPress：更新期間的遠端程式碼執行

**CVE-2026-119977｜11/03 列入 CISA KEV**

WordPress 更新流程的競爭條件可能讓攻擊者在升級期間執行程式碼。7.1.4 已於 10/28 修補；本週的新進展是確認實際利用，而不是首次發布修補。

有部署 WordPress 時，確認已安裝 7.1.4 或所屬舊分支的對應安全更新，並檢查更新期間的異常存取。不要只確認主站，測試站與活動網站也應納入盤點。

來源：[WordPress 7.1.4](https://wordpress.org/news/2026/10/wordpress-7-1-4/)、[加拿大網路安全中心 AV26-1117](https://www.cyber.gc.ca/en/alerts-advisories/wordpress-security-advisory-av26-1117)。

## 3. SonicWall：SSL VPN 驗證繞過

**CVE-2026-19868｜11/06 列入 CISA KEV**

這項 SonicOS SSL VPN 漏洞涉及驗證流程，原報告追蹤的是 SAML／MFA 繞過風險。加拿大網路安全中心確認 SonicWall 已表示漏洞遭到利用，並列出 `7.3.4-7013`、`8.2.2-8015` 的修補門檻。

應優先確認設備所屬分支、實際版本、VPN 對外暴露與異常登入紀錄。各機型及設定適用性仍以原廠公告為準；本次未能讀取原廠動態頁面的完整條件，因此不沿用原報告的 CVSS 數字。

來源：[SonicWall SNWLID-2026-0014](https://psirt.global.sonicwall.com/vuln-detail/SNWLID-2026-0014)、[加拿大網路安全中心 AV26-1133](https://www.cyber.gc.ca/en/alerts-advisories/sonicwall-security-advisory-av26-1133)。

## 4. GCP／Linux Kernel：TCP 漏洞

**CVE-2026-98432｜GCP-2026-078｜11/04**

Linux IPv4 TCP 堆疊漏洞可能造成核心當機或容器逃逸。Google 列出 GKE Standard、Autopilot 受影響；網路攻擊需要連得到相關 TCP listener，容器內亦有本地觸發途徑。Google 此公告的產品風險分級為 Medium，不等同原報告引用的通用 CVSS 分數。

盤點時須區分作業系統、Kernel flavor 與實際運行核心，不能把 generic 核心狀態套到 `linux-gcp`。本次未重建 11/09 各發行版的歷史修補矩陣，請依官方現況核對，更新後確認新核心已生效。

來源：[Google Cloud GCP-2026-078](https://docs.cloud.google.com/support/bulletins#gcp-2026-078)。

## 5. Ubuntu：Java 憑證信任庫未同步

**USN-9001-1｜11/05**

系統 CA bundle 移除憑證後，Java JKS keystore 可能未同步移除，讓 Java 程式繼續信任已撤除的 CA。更新會修正同步行為並重新同步信任庫；公告沒有獨立 CVE。

| Ubuntu | `ca-certificates` | `ca-certificates-java` |
| --- | --- | --- |
| 22.04 | `20260816ubuntu0.22.04.2` | `20190909ubuntu1.4` |
| 24.04 | `20260816ubuntu0.24.04.2` | `20240118ubuntu0.24.04.1` |
| 26.04 | `20260816ubuntu0.26.04.2` | `20260311ubuntu0.26.04.1` |
| 26.10 | `20260816ubuntu0.26.10.2` | `20260311ubuntu0.26.10.1` |

使用自訂 JKS、JDK 內建信任庫或容器映像時，須另外確認，不能只看 OS 套件更新。

來源：[Ubuntu USN-9001-1](https://ubuntu.com/security/notices/USN-9001-1)。

## 6. Google Cloud SDK：Python／Java 憑證更新

**GCP-2026-075｜11/02**

eMudhra 憑證私鑰事件影響仍信任相關 CA 的應用程式。Google 表示其基礎設施未遭入侵，遙測未見相關工作負載利用證據。

公告要求檢查 `certifi`（至少 `2026.10.19`）、`httplib2`（`0.32.1`）、`grpcio`（`1.84.1` 或其他已修補分支），以及 Java `google-api-client`（`2.9.2`）。gRPC 使用的憑證集合不一定來自 OS，更新作業系統不代表應用程式已修好。完成依賴更新後重新建置、部署映像。

來源：[Google Cloud GCP-2026-075](https://docs.cloud.google.com/support/bulletins#gcp-2026-075)。

## 7. NGINX：舊版 Ubuntu 補上安全更新

**USN-8955-2｜11/05**

本次把先前 NGINX 修補擴及 Ubuntu 20.04、18.04、16.04、14.04，並修正 CVE-2026-42533。特定 regex、capture variable、`map` 或 `alias`／rewrite 組合可能造成當機或程式碼執行；僅看到 `alias` 不足以判定符合觸發條件。

Ubuntu 20.04 的公告修補版本為 `1.18.0-0ubuntu1.7+esm4`，其他舊版須對照各自套件表及 Pro／ESM 資格。Ubuntu 22.04 以上則查 USN-8955-1；Debian 必須另查其 Tracker，不能套用 Ubuntu 結論。本次未重新確認 Debian 12 的即時修補狀態。

來源：[Ubuntu USN-8955-2](https://ubuntu.com/security/notices/USN-8955-2)。

## 8. Chrome 157：瀏覽器安全更新

**11/03 Stable 發布**

公告版本為 Linux `157.0.8103.38`，Windows／macOS `157.0.8103.38/.39`，包含記憶體安全等問題，且有 Critical 項目。應更新瀏覽器並重新啟動，確認新版本已實際載入。

**11/13 校訂：** 原週報寫 213 項修補，部分搜尋摘要仍如此顯示，但官方公告正文目前寫 **212 項**，本文以正文為準。原週報只舉低風險 CVE，不能代表整次更新的嚴重程度。本次未確認這批項目的野外利用狀態。

來源：[Chrome Releases](https://chromereleases.googleblog.com/2026/11/stable-channel-update-for-desktop.html)。

## 9. AWS Serverless MCP Server：路徑穿越

**CVE-2026-116635｜11/02**

能影響 MCP agent 輸入的攻擊者，在特定條件下可讀取部署狀態目錄以外的 JSON；若啟用寫入，也可能建立或覆寫目錄外的 JSON。

`awslabs.aws-serverless-mcp-server` 低於 `0.2.1` 受影響，`0.2.1` 已修補。AWS 未提供替代緩解措施，應更新套件，分叉版本也須帶入修正。公告未列 CVSS，本次未確認實際利用。

來源：[AWS 2026-164](https://aws.amazon.com/security/security-bulletins/2026-164-aws/)。

## 10. AWS EKS：NetworkPolicy 隔離繞過

**CVE-2026-122266｜11/04**

共享 eBPF 連線狀態隔離不足，可能讓具相鄰環境存取能力的已驗證使用者繞過同節點其他 Pod 的 ingress NetworkPolicy。

| 元件 | 受影響版本 | 修補版本 |
| --- | --- | --- |
| `aws-network-policy-agent` | `< 1.3.7` | `1.3.7` |
| Amazon VPC CNI Managed Add-on | `< 1.22.3` | `1.22.3` |

AWS 表示沒有替代緩解措施。使用 EKS NetworkPolicy 時應確認元件版本及更新後的網路隔離行為。公告未列 CVSS，本次未確認實際利用。

來源：[AWS 2026-170](https://aws.amazon.com/security/security-bulletins/2026-170-aws/)。

## 11. AWS Babelfish：TDS 記憶體安全漏洞

**CVE-2026-119923、CVE-2026-119924｜11/06**

前者涉及 TDS 握手，可由未驗證遠端攻擊者影響資料庫程序；後者涉及 TDS RPC，已驗證攻擊者可能讀取鄰近記憶體或造成服務中斷。

Babelfish for PostgreSQL extension 的修補版包含 `4.10`、`5.6`、`6.1`。Aurora 的修補門檻依分支不同，應對照公告中的 Aurora／Babelfish 版本配對，並完成待處理維護，不能直接套用 extension 版號。更新前可先把 TDS 連接埠來源限制為可信來源。本次未確認實際利用。

來源：[AWS 2026-166](https://aws.amazon.com/security/security-bulletins/2026-166-aws/)。

## 12. Python：Pillow、Twisted、Tornado

三項更新的適用情境不同，不應只用「Python 有漏洞」概括。

| 元件／公告 | 影響與處理 |
| --- | --- |
| Pillow／USN-8999-1，11/04 | 影像、字型與 filter 處理可造成資訊外洩、資源耗盡，部分問題可能執行程式碼；處理不可信影像的服務應檢查依賴。 |
| Twisted／USN-9000-1，11/04 | CVE-2026-106454 涉及 IMAP mailbox list wildcard；已驗證使用者可造成資源耗盡。Ubuntu 22.04 對應 `22.1.0-2ubuntu2.8`。 |
| Tornado／USN-8952-2，11/06 | CVE-2026-103263 的先前修補不完整，造成繼承 `StaticFileHandler` 的應用（如 Jupyter）靜態檔案服務回歸，本次予以修正。 |

APT 安裝的 Python 套件與 `pip`、Poetry、`uv` 的虛擬環境要分開盤點。更新後除了版本檢查，也應測試影像處理、郵件及靜態檔案功能。

來源：[Pillow](https://ubuntu.com/security/notices/USN-8999-1)、[Twisted](https://ubuntu.com/security/notices/USN-9000-1)、[Tornado](https://ubuntu.com/security/notices/USN-8952-2)。

## 13. Debian：APT、zlib 與 Kernel 公告

| 日期／公告 | 套件 | 重點 |
| --- | --- | --- |
| 11/04 DSA-6607-1 | APT | CVE-2026-109518；Trixie 修補版 `3.0.4`，詳細條件見第 1 節。 |
| 11/07 DSA-6613-1 | zlib | 特製輸入可能造成 DoS 或程式碼執行；Trixie 修補版 `1:1.3.dfsg+really1.3.1-1+deb13u1`。 |
| 11/08 DSA-6616-1 | Linux | 權限提升、DoS、資訊外洩等問題；Trixie 修補版 `6.12.116-1`。 |

上述 DSA 的版本表主要針對 Debian 13（Trixie）。Debian 12（Bookworm）應另看 Tracker／LTS 公告，不能因為 DSA 已發布就認定同樣修好。

來源：[APT 公告](https://lists.debian.org/debian-security-announce/2026/msg00526.html)、[zlib 公告](https://lists.debian.org/debian-security-announce/2026/msg00532.html)、[Linux 公告](https://lists.debian.org/debian-security-announce/2026/msg00536.html)。

## 14. PostgreSQL 14：支援期限到期

這不是新漏洞，而是版本維護期限。官方版本政策列出的 PostgreSQL 14 最終發行日為 **2026/11/12**。

**11/13 更新：** 官方目前列出 `14.25`，因此原報告「最後版本為 14.24」的說法不再適用。盤點仍使用 14 的資料庫，確認升級或額外維護方案；最後一次小版本更新不能取代後續主版本遷移。大版本升級需先測試資料遷移、擴充套件與回復流程。

來源：[PostgreSQL 版本政策](https://www.postgresql.org/support/versioning/)。

## 其他平台追蹤

以下保留 11/09 原報告的追蹤範圍。原檢索未取得足夠證據列出該週新增重大事件；這不是「沒有漏洞」的保證，11/13 的補稿也沒有重跑所有平台的完整歷史調查。

| 平台 | 本期紀錄與後續關注 |
| --- | --- |
| GitHub／Actions | 未確認新的重大平台事件；持續盤點第三方 Action、依賴及 token 權限。 |
| Docker Engine／Desktop | 未確認該週新增重大公告；原報告提及既有憑證紀錄風險，但本次未核實其具體公告，不將它列為已確認新事件。 |
| Windows／Microsoft 365 | 原報告未確認另需列為緊急處理的新事件。 |
| Azure | 原報告未確認需客戶立即處理的新重大公告。 |
| Figma | 未確認可由官方來源支持的該週重大事件。 |
| OpenAI／ChatGPT／API | 未確認可由官方來源支持的該週重大事件。 |
| Anthropic／Claude／API | 未確認可由官方來源支持的該週重大事件。 |
| Gemini／Gemini API | 未確認可由官方來源支持的該週重大事件。 |

## 檢查順序

1.  確認是否使用 WordPress、SonicWall，優先處理已知遭利用項目。
2.  檢查 APT、NGINX、Kernel 的完整套件版本與適用設定。
3.  分別檢查 OS、Java、Python 與容器的憑證信任庫及依賴。
4.  盤點 EKS、MCP Server、Babelfish，套用對應分支的更新。
5.  更新瀏覽器，處理 PostgreSQL 14 的版本遷移。

以下只讀取本機狀態，不會安裝更新：

```bash
apt-cache policy apt nginx ca-certificates ca-certificates-java
apt-config dump | grep -i 'Acquire::Retries'
uname -r
```

套件版本、執行中的版本及設定條件都要符合，才可判定修補生效。本文未檢查任何個別主機，也未保留私人環境設定。
