---
title: TS中的Declaration Merging
date: "2022-4-23"
template: "post"
draft: false
slug: "/post/declartion-merging"
category: "TypeScript"
tags:
  - "TypeScript"
description: 抓住四月的小尾巴，记录有意义的东西。"
socialImage: "/media/42-line-bible.jpg"
---

抓住四月的小尾巴，记录有意义的东西。    
这周同事遇到一个难题向我求救，这个问题如下：

![declaration-merging.png](/media/declaration-merging.png)

大概的意思就是ts没有识别出挂载在vue上的常量，这不简单吗？在声明文件里面添加声明即可，添加如下：

![declaration-merging-type.png](/media/declaration-merging-type.png)

按道理全局声明写好了，那报错也应该被解决，可成功哪能怎么简单😭。经过多次尝试，我把位于项目根目录下的此声明文件挪入到src/下，此问题解决了。另外一个解决办法是修改tsconfig.json，例如添加如下代码：

![declaration-merging-config.png ](/media/declaration-merging-config.png )
  
## 复盘
1. 当同事和我遇到这个问题时，我们不确定声明文件这样写是否正确的，又去花时间google一下然后一顿瞎写。
2. 对TS的执行机制不熟悉。
3. 如果对上面两点有理解这个问题大概率在5分钟内能解决，不过我们花了约一小时 。 

针对第一个问题，主要是ts中Declaration Merging，为什么需要这些写，可以看看官方文档中的[module-augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation)。大致的意思是针对于已经存在的对象类型声明文件，我们可以通过Declaration Merging增强对象功能。比如vue声明文件中写的声明主要是对node_modules中的vue/types/vue中的interface做类型增强。TS会把两份类型文件声明中对同一个类型的定义合并为一份。
```
declare module 'vue/types/vue' {
    interface Vue {
		// $router: VueRouter;
		// $route: Route;
        $http: string;
        haloDomain: Domain;
        kcsDomain: Domain;
	}
}
```
第二个问题其很简单，ts需要配置你需要解析的文件，在此项目中也配置了，但是别忘了声明文件也是需要解析文件中的一员，所以同事遇到的问题根本原因是排除了根目录下的声明文件的解析，导致ts不能正确的识别自定义的属性。

## 拓展
问题解决了，我们还需要知道Declaration Merging的知识点，接下来就是看官方文档+自己的理解记录这个知识点吧。   
“declaration merging”：TS会把两份类型文件声明中对同一个类型的定义合并为一份。在ts中，一份声明文件创建了entities，entities至少是namespace、type、value中一种。namespace-creating declaration了包含可以通过namespace.访问names，type-creating declaration创建描述对象形状的接口，value-creating declaration创建可以在产物中可见的value。
![declaration-mergin-table.png ](/media/declaration-mergin-table.png )

### merging interface
```
interface Box {
  height: number;
  width: number;
}
interface Box {
  scale: number;
}
let box: Box = { height: 5, width: 6, scale: 10 };
```
多个interface合并成一个，每个Box下的key应该唯一，如果不唯一，需要保证类型统一，不然ts会报错。针对与key为函数类型的成员，合并之后的函数成员具有重载功能。
```
interface Cloner {
  clone(animal: Animal): Animal;
}
interface Cloner {
  clone(animal: Sheep): Sheep;
}
interface Cloner {
  clone(animal: Dog): Dog;
  clone(animal: Cat): Cat;
}
```
后写的合并后具有优先权，合并为
```
interface Cloner {
  clone(animal: Dog): Dog;
  clone(animal: Cat): Cat;
  clone(animal: Sheep): Sheep;
  clone(animal: Animal): Animal;
}
```
针对函数合并规则，当参数类型为单字符串，有如下的合并顺序
```
interface Document {
  createElement(tagName: any): Element;
}
interface Document {
  createElement(tagName: "div"): HTMLDivElement;
  createElement(tagName: "span"): HTMLSpanElement;
}
interface Document {
  createElement(tagName: string): HTMLElement;
  createElement(tagName: "canvas"): HTMLCanvasElement;
}
```
```
interface Document {
  createElement(tagName: "canvas"): HTMLCanvasElement;
  createElement(tagName: "div"): HTMLDivElement;
  createElement(tagName: "span"): HTMLSpanElement;
  createElement(tagName: string): HTMLElement;
  createElement(tagName: any): Element;
}
```
### merging namespace
namespace创建namespace和value，未完待续....