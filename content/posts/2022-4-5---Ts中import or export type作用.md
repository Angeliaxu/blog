---
title: TS中import or export type作用
date: "2022-4-5"
template: "post"
draft: false
slug: "/post/import-or-export-type"
category: "TypeScript"
tags:
  - "TypeScript"
description: "本周在进行技术分享会上，同事分享了技术栈的升级操作，其中关于“为什么在import 或者 export 要加上type？”这个问题上没有得到解答，本着好奇之心，去看了看相关的的文档与解答，这就来说说why"
socialImage: "/media/42-line-bible.jpg"
---

本周在进行技术分享会上，同事分享了技术栈的升级操作，其中关于“为什么在import 或者 export 要加上type？”这个问题上没有得到解答，去看了看相关的的文档与解答，这就来说说why。 

首先看看关于这个问题的一个[issue](https://github.com/webpack/webpack/issues/7378)：大致的意思是在同时引入type与常量的时候，webpack找不到导出type的地方，导致报错。原因可以通过[这里](https://devblogs.microsoft.com/typescript/announcing-typescript-3-8-beta/#type-only-imports-exports)了解到：ts会在编译的时候把interface和type去掉，类似于下面这些👇🏻：

编译前
```
// ./foo.ts
interface Options {
    // ...
}

export function doThing(options: Options) {
    // ...
}

// ./bar.ts
import { doThing, Options } from "./foo.js";

function doThingBetter(options: Options) {
    // do something twice as good
    doThing(options);
    doThing(options);
}
```
编译后
```
// ./foo.js
export function doThing(options: Options) {
    // ...
}

// ./bar.js
import { doThing } from "./foo.js";

function doThingBetter(options: Options) {
    // do something twice as good
    doThing(options);
    doThing(options);
}

```
从上面代码看出，编译前后，interface相关的导入被消除掉了，但是真正使用的地方还是在使用，这种现象叫做import elision。import elision还会导致其他问题：例如在导出types的ts中文件中有一些副作用操作，因为import elision从而导致副作用不生效。类似于下面👇🏻：在当前文件中引入类型声明，在runtime的时候类型声明会被消除掉（小白不知道ts会做消除这个动作），但是类型声明的文件中存在副作用的操作，比如全局注册，此时需要手动再引入一次来保证副作用能生效（大佬知道这么一个原理）。
```
//import { SomeTypeFoo, SomeOtherTypeBar } from "./module-with-side-effects";

// This statement always sticks around.
import "./module-with-side-effects";
```

所以在TS3.8版本中，解决上面的问题，也为了让开发者更明确的知道到底导入导出的是一个什么东西，所以新增了type-only语法。  

```
import type { SomeThing } from "./some-module.js";

export type { SomeThing };
```
开发者明确的知道上面导入导出是一个类型声明，TS也可以放心的消除掉，相关的TS配置选项是importsNotUsedAsValues，另外值得注意的一点是有些类型声明可以当做值来使用，如果使用了type语法，只能当做type使用。

总结：新增的type导入导出语法是为了解决：基于ts有import elision机制导致某些副作用会被消除掉，为了让开发者明确的知道当前导入导出是类型还是值，更规范的去约束语法，减少bug的产生。
