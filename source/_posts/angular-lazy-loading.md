---
title: "Angular Lazy Loading"
date: 2022-05-29
author: "Andy Hung"
categories:
  - Angular
---

在 Angular 應用程式一載入時，預設會將所有的 Module 一次全部載入，但如果今天應用程式規模很大，或是某些 Module 中需要載入的東西過多，就會拖到整個應用程式的載入時間。

為了解決這個問題，Angular 有針對 Module 提供 Lazy Loading 的功能，簡單來說就是當需要此 Module 的時候再進行載入，如此就不會影響到整個應用程式的效能。

<!-- more -->

## 實現方式

透過 Angular Router 中內建的功能即可實現，步驟如下：

1.  修改`app-routing.module.ts`

```javascript
const routes: Routes = [
  {
    path: 'customers',
    loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule)
  }
];
```

利用`loadChildren`這個屬性，我們就可以透過 import 將我們想要 lazy loading 的 Module，在應用程式觸發到`path`中定義的路由(在這個例子中就是`/customers`)的時候將 CustomersModule 進行載入。

2.  修改`customers.module.ts`

```javascript
import { CustomersRoutingModule } from './customers-routing.module';

@NgModule({
  declarations: [
    CustomersComponent
  ],
  imports: [
    CommonModule,
    CustomersRoutingModule
  ]
})
```

額外新增`customers-routing.module.ts`，並新增到 CustomersModule 的 imports 中，我們會將關於此 Module 下 Router 的設定拆出來放在這個檔案中。

3.  新增`customers-routing.module.ts`

```javascript
const routes: Routes = [
  { 
    path: 'info', 
    component: CustomersComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }
```

這邊我們就可以定義在子路徑下要載入哪個 Component，最終的路徑會是原本`app-routing.module.ts`中定義的`path`加上這邊定義的`path`，以上例來說就會是在`/customers/info`下讀取到 CustomersComponent。這邊要注意需要用`forChild`來定義子路由。

## 透過指令建立

如果我們在一開始就決定要使用 lazy loading 的方式載入 Module，也可以選擇用以下指令直接建立好上述的元件：

```shell
ng generate module customers --route customers --module app.module
```

## 實驗

我們可以在`customers.components.ts`中加上`console.log`來實驗是否有 lazy loading

```javascript
export class CustomersComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log("Customers Component Init");
  }
}
```

-   讀取 [http://localhost:4200](http://localhost:4200/)
    ![localhost:4200](https://i.imgur.com/pE6DTB9.png)
    
-   讀取 [http://localhost:4200/customers](http://localhost:4200/customers)
    ![localhost:4200/customers](https://i.imgur.com/ncZUBab.png)
    

## 注意事項

-   如果 Module 需要 lazy loading，需注意`app.module.ts`裡面不可以 import 到這個 Module，否則還是會在應用程式啟動時就載入。
