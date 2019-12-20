---
title: Css GPU Animation
date: "2019-11-24"
template: "post"
draft: false
slug: "/post/cssGPUAnimation/"
category: "CSS"
tags: 
    - "CSS"
    - "optimization"
description: "大部分人知道GPU能帮助渲染网页，特别是带有动画的。比如一个带有transform的CSS动画比使用left、top的动画看起来要流畅很多。那么用户会问，我怎么样才能让GPU参与渲染动画？你可能听到的答案是：使用transform或者will-change：transform;属性。"
socialImage: "/media/42-line-bible.jpg"
---
大部分人知道GPU能帮助渲染网页，特别是带有动画的。比如一个带有transform的CSS动画比使用left、top的动画看起来要流畅很多。那么用户会问，我怎么样才能让GPU参与渲染动画？你可能听到的答案是：使用transform或者will-change：transform;属性。就像为IE使用zoom属性一样，这些属性声明**动画渲染让GPU来操作**，或者叫**compositing：GPU合成** -- 浏览器厂商更喜欢这样叫。   

但是有些时候，一个简单的动画演示在真实的网站当中运行的却很慢，甚至会让浏览器崩溃，这是为什么？怎么解决？
### 免责声明
在深入研究GPU合成之前，需要让您知道：GPU合成不是一个规范，你在W3C上是找不到任何关于GPU合成是怎么工作的描述。这只是浏览器对执行某些任务进行的优化，并且每家浏览器厂商都以自己的方法进行了不同的实现。
### 合成层是怎样工作的
准备一个页面，有A元素与B元素，两者都有相同的position：absolute、不同的z-index。CPU对页面进行绘制图像，然后把图像发送给GPU，GPU展示在屏幕上。
```
<style>
    #a, #b {
        position: absolute;
    }

    #a {
        left: 30px;
        top: 30px;
        z-index: 2;
    }

    #b {
        z-index: 1;
    }
</style>
<div id="a">A</div>
<div id="b">B</div>

```
![gpu.jpg](/media/gpu.jpg)
使用left属性让A动起来
```
<style>
    #a, #b {
        position: absolute;
    }

    #a {
        left: 10px;
        top: 10px;
        z-index: 2;
        animation: move 1s linear;
    }

    #b {
        left: 50px;
        top: 50px;
        z-index: 1;
    }

    @keyframes move {
        from { left: 30px; }
        to { left: 100px; }
    }
</style>
<div id="a">A</div>
<div id="b">B</div>
```
在这个例子中，动画的每一帧，浏览器都得重新计算元素的几何位置（回流），接着绘制页面图像（重绘），最后发送给GPU展示在屏幕上。众所周知，回流很耗性能，现在浏览器足够智能的知道需要回流哪部分区域元素，而不是整个页面。在浏览器里面使用layer来检查页面分层情况如下，A和B元素处在同一层。

![before-layer.jpg](/media/before-layer.jpg)

接着来看这个动画渲染性能，动画的改变不断的引起回流和重绘，可以看见rendering和painting所花的时间。

![after.jpg](/media/after.jpg)

在动画的每一步进行回流和重绘听起来就很慢，特别是一个大型而复杂的布局。那这样呢 -- 绘制两个不同的图像，一个图像包含A元素，另一个图像不包含A元素的的整个页面，两个图像位置相对偏移。也就是说，合成被缓存元素的图像可以使动画更快，这也正是GPU的亮点。

为了使合成层达到最优，浏览器必须确保CSS动画属性满足以下条件  
* 不影响文档流
* 不依赖于文档流
* 不会引起重绘  

有些用户可能认为left、top、position：absolute或者fixed不会依赖于元素环境，但是当left或者top接受一个百分比的数值，这时候就会依赖于父元素的大小来取值了，其他的还有em、vh也是这样。transform和opacity是唯一满足上面三个条件的CSS属性了。   

使用transform来改写上面的例子
```
<style>
    #a, #b {
        position: absolute;
    }

    #a {
        left: 10px;
        top: 10px;
        z-index: 2;
        animation: move 1s linear;
    }

    #b {
        left: 50px;
        top: 50px;
        z-index: 1;
    }

    @keyframes move {
        from { transform: translateX(0); }
        to { transform: translateX(70px); }
    }
</style>
<div id="#a">A</div>
<div id="#b">B</div>

```
看下页面上使用transform之后页面的分层情况，可以看见A元素被单独提取出来当做一层，其他的为一层。

![after-layer.jpg](/media/after-layer.jpg)

接着看下性能，可以感受到rendering和painting花费的时间相比之前减少了很多很多。

![before.jpg](/media/before.jpg)

上述例子在浏览器中告诉浏览器哪些CSS属性需要更新，浏览器识别到transform属性更新不会引起回流与重绘，于是把两张图像绘制成合成层发送给GPU。这样动画就不需要CPU反复的为我们继续计算，就算有大量的JS计算也不会影响动画的流畅性。一切由GPU来为我们完成。

### GPU是什么？ 
GPU就像是另一台电脑，有自己的处理器，以及内存、数据处理模型。是现代设备必需的一部分。浏览器与他进行通信就像与外部设备之间通信一样。就好像AJAX，你不可能让服务器自己收集浏览器里面用户填写的表单数据，需要你收集这些数据放在一个payload内发送给服务器。这个过程和合成层是一样的，GPU就像一个远程服务器，浏览器必须组装好绘制页面的payload发送给GPU。然而，浏览器到GPU之间的数据传输如果花费3~5秒会造成动画的不稳定性。
payload里面包含了分层图像，层的大小、偏移量、动画数据等等。

### 哪些属性可以造成分层？
* 3D transform：translate3d，translateZ等等
* video，canvas、iframe元素
* 通过animation或者transition 改变transform或者opacity
* position：fixed
* will-change
* filter