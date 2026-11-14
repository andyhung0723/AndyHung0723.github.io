---
title: "探討 Angular Module"
date: 2022-05-28
author: "Andy Hung"
categories:
  - Angular
---

Angular 本身的設計概念就是使用模組化的機制，Module (模組) 是組成 Angular 應用程式的基本單位，每個 Angular 專案最開始都會有一個模組當作程式進入點，稱為**根模組(Root Module)** 。透過 Angular CLI 創建的專案會將此根模組命名為`AppModule`，並放在`app.module.ts`檔案中。

也可以將有相同特性的功能拆出來，組合成不同的模組，各個模組間依程式架構相互引用，組合成 Angular 應用程式。模組中可以透過設定的方式，定義此模組中包含的 components、directives、pipes 等，以及其他與模組相關的屬性，以下我們就來研究一下 Angular Module 的使用方式以及使用情境。

<!-- more -->

## 組成

```javascript
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
```

定義模組的檔案中會包含`@NgModule`，用來定義模組的設定。主要包含以下幾個屬性：

### declarations

用來宣告此模組中包含的 components、directives、pipes。

```javascript
declarations: [
  UserComponent,
  CustomPipe,
  FileDirective
],;
```

-   若使用`ng generate` 指令來產生物件，Angular CLI 會自動幫你把物件加入 declarations 中。

### imports

想要額外載入的 module，載入後就可以使用該 module 中 exports 的物件。

```javascript
imports: [
  BrowserModule,
  UserModule
],
```

-   如上例，只要 import UserModule，模組內就可以使用 UserModule 中 export 的所有物件。
-   根模組必須要 import BrowserModule。
-   其他模組必須要 import CommonModule。
-   只要是用 CLI 建立的，上述兩項都會自動 import。

### exports

要匯出給其他模組使用的物件。

```javascript
declarations: [
  UserComponent,
  CustomPipe,
  FileDirective
],;
exports: [
  UserComponent
],
```

-   要 export 的物件必須存在於 declarations 或 import 的 Module 中才可以。
-   上例 export 的只有 UserComponent，因此引入此 module 的模組只可使用 UserComponent。

### providers

宣告可以依賴注入的 service，整個應用程式都可以使用到此處宣告的 service。

```javascript
providers: [
  UserService
],
```

關於 providers 會再整理一篇文章進行探討。

### bootstrap

```javascript
bootstrap: [AppComponent],
```

定義根元件，作為應用程式啟動後預設讀取的元件，只有根模組需要定義此屬性，一般不太需要更動。

## 使用情境

Module 用法除了最基本會有的**根模組(Root Module)** 外，常見的還有以下兩種用法：

### Feature Module

其實就是最常見、第一個會想到使用 Module 的情境。將應用程式中你認為可以額外拆出來撰寫成一個功能的程式片段，拆出來成為一個 Module，就會稱它為`Feature Module`。

例如假設今天要實作一個網頁聊天室，聊天室可以傳送的訊息種類分為文字、檔案、圖片、貼圖等，我們就可以把傳送的\*\*「訊息」\*\* 拆一個 MessageModule，裡面包含 TextComponent、FileComponent、ImageComponent … 與其他串接的 Service 等。

### Shared Module

在 Angular 中常常會遇到很多物件(component、directive、pipe)一直被重複使用，此時為了不讓這些物件散落各地，還要讓 Module 一直引用來引用去，通常可以建立一個`Shared Module`來統一管理這些物件，要使用這些物件的 Module 只需要匯入一個`Shared Module`就可以了。

```javascript
@NgModule({
  declarations: [
    TableComponent, 
    PagerComponent, 
    PaginationComponent
  ],
  exports: [
    TableComponent, 
    PagerComponent, 
    PaginationComponent
  ],
})
export class SharedModule {}
```

-   如上例，其他模組只需要 import `SharedModule` 就可以使用裡面的所有物件。
