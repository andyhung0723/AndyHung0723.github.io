---
title: "Angular 取得元素 offsetWidth 時有誤解法"
date: 2022-06-01
author: "Andy Hung"
categories:
  - Angular
---

今天在工作上遇到一個問題，我有一個功能執行時會切換兩個 Angular Component 的顯示，當切換到其中一個 Component 時，我會去抓取當下它的 offsetWidth 做運算使用，但抓這個 offsetWidth 卻憑空少了`15px`，後來在找了一段時間終於找到原因，在這邊以一個簡化過的例子紀錄一下。

<!-- more -->

> 範例連結：[https://stackblitz.com/edit/angular-ivy-bmpsfk](https://stackblitz.com/edit/angular-ivy-bmpsfk)

## 問題

假設有一個按鈕，點擊之後可依狀態顯示不同的 Component。

```html
<div class="container">
  <app-first *ngIf="visibleComponent === 'first'; else second"></app-first>
  <ng-template #second>
    <app-second></app-second>
  </ng-template>
</div>

<button (click)="switch()">switch</button>
```

![first component layout](https://i.imgur.com/1wC0QPT.png)

![second component layout](https://i.imgur.com/FIp0NkZ.png)

在 first component 中我們嘗試取得該元素的`offsetWidth`。

```html
<div #content>first component</div>
```

```javascript
...
ngAfterViewInit() {
  console.log('content width: ', this.content.nativeElement.offsetWidth);
}
...
```

結果在當由 second 切換到 first 時，取得的 offsetWidth 為`624px`，但實際應為`639px`，少了`15px`。

![result01](https://i.imgur.com/aXiPGrV.png)

## 原因

經過測試後發現當有載入`BrowserAnimationsModule`才會發生此問題，且是 second component 中有 scroll bar 的原因，導致在取得 offsetWidth 時少了 15px。

![second component layout](https://i.imgur.com/FIp0NkZ.png)

但明明我是在 first component 中取 offsetWidth 阿？怎麼會吃到 scroll bar？

原來是在 ngAfterViewInit 執行的當下子 Component 的畫面會比父 Component 還早運算，我們 ngIf 的條件是寫在父 Component 進行判斷，所以當下吃到的父層寬度還會保留在切換到另一個 Component 之前。

> 子 Component 的 ngAfterViewInit 也會比父 Component 的同一個事件還早執行。

由於 second component 多了 scroll bar，且在載入`BrowserAnimationsModule`時 scroll bar 會被算成 15px 的空間，所以在取得 offsetWidth 會少了 scroll bar 佔去的寬度。

## 解法

由於是執行順序的問題，所以最簡單的解法就是透過`setTimeout`將取得 offsetWidth 的動作強制移動置 event loop 的最後執行。

```javascript
ngAfterViewInit() {
  console.log('content width: ', this.content.nativeElement.offsetWidth);

  setTimeout(() => {
    console.log(
      'content width after: ',
      this.content.nativeElement.offsetWidth
    );
  });
}
```

執行結果
![result02](https://i.imgur.com/w0wPgDe.png)

目前只有嘗試到這個方式，若有找到更好的寫法會再更新。
