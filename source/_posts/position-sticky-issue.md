---
title: "position:sticky 遇到 overflow 時失效解法"
date: 2022-06-08
author: "Andy Hung"
categories:
  - CSS
---

今天在處理將 table 表頭凍結在最上方時，找到了使用`position: sticky`的方式解決，但若我要同時在小畫面時讓這個 table 的 X 軸能夠有 scroll bar 卻出現了問題，以下紀錄一下問題原因與解決方式。

<!-- more -->

> 範例連結：[https://codepen.io/andyhung0723/pen/YzeOovW](https://codepen.io/andyhung0723/pen/YzeOovW)

## 問題

假設我有一個 table，若我想將它的表頭凍結在最上方不動，可以使用`position: sticky`：

```css
.table-sticky .th {
  position: sticky;
  top: 0;
}
```

若在小畫面時想要此 table 不要撐開整體寬度，一般會在外層使用`overflow-x: auto`來讓 X 軸產生 scroll bar：

```css
.table-sticky-container {
  overflow-x: auto;
}
```

此時就會發現**原本`position: sticky`的凍結效果卻失效了**。

## 原因

經測試發現只要`position: sticky`上所有階層的父元素只要有一個的`overflow`值是`visible`以外的其他值，就會導致失效。

## 解法

目前單純使用 CSS 貌似沒有解法，因此我使用 JavaScript 的 scroll 事件來動態 transform 表頭的位置來解決，程式碼如下：

```javascript
window.addEventListener('scroll', function(event) {
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  var stickyTables = document.querySelectorAll('.table-sticky');
  for(var i = 0 ; i < stickyTables.length ; i++) {
    var thead = stickyTables[i].querySelector('thead');
    var offsetTop = stickyTables[i].offsetTop;
    var offsetHeight = stickyTables[i].offsetHeight - thead.offsetHeight;
    var transformY = getTranslateY(thead);
    if(scrollTop >= offsetTop && scrollTop <= offsetTop + offsetHeight) {
      transformY = scrollTop - offsetTop;
    }else if(scrollTop < offsetTop){
      transformY = 0;
    }
    thead.style.transform = 'translateY('+ transformY +'px)';
  } 
});

function getTranslateY(element) {
  var style = window.getComputedStyle(element);
  var matrix = new WebKitCSSMatrix(style.transform);
  return matrix.m42;
}
```
