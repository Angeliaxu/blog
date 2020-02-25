---
title: Websocket
date: "2020-02-23"
template: "post"
draft: false
slug: "/post/Websocket/"
category: "JavaScript"
tags:
  - "js"
description: "最近在工作当中用到了websocket，之前没有接触过，趁这次使用完的机会，总结一下对websocket的使用。这次需求需要服务器频繁的向客户端推送消息，并且客户端还需要实时的监听服务端发过来的消息作出响应"
socialImage: "/media/42-line-bible.jpg"
---

最近在工作当中用到了 websocket，之前没有接触过，趁这次使用完的机会，总结一下对 websocket 的使用。这次需求需要服务器频繁的向客户端推送消息，并且客户端还需要实时的监听服务端发过来的消息作出响应，像这种频繁的实时监听以及收消息使用传统的 XHR 轮询是不够的，XHR 轮询这种方式只能针对于小场景的监听需求，另外轮询是很消耗资源的。在使用 websocket 的过程当中，虽然顺利的完成了项目需求，但是事后感觉并没有学到什么，工欲善其事必先利其器，希望下次遇到此类需求任务，能够更好的使用 websocket。

### websocket 是什么？

websocket 和 http 协议一样，属于应用层的协议，在 webscoket 当中，只需要完成一次握手协议，两者之间就能建立起持久性的链接。进而实现双向数据传输，客户端与服务端交换数据会更简单，特点在于

1. websocket 可以主动的由服务端向客户端推送消息，
2. 没有同源策略限制
3. 与 http 有着良好的兼容性（兼容现有浏览器握手规范），默认端口也是 80 或者 443，握手阶段采用 http 协议，因此握手不容易被屏蔽，能通过各种 http 代理服务器。
4. 未加密的标识符是 ws，加密则是 wss
5. 小 header，只有 2Bytes 左右
6. 服务器不用再被动的接受到浏览器请求之后才能返回数据，可以自己把控
7. 更好的节省了服务器资源与宽带

websocket 与服务端建立连接之后，会有心跳 💓 时间，指的是，客户端每隔一定时间发送心跳包，会向服务端告知目前客户端的状态，服务端也会向客户端返回数据包，彼此之间确定是否相互正常连接状态。

### websocket API

使用 WebSocket 类来初始化实例，类下面的常量有

1. WebSocket.CONNECTING => 0
2. WebSocket.OPEN => 1
3. WebSocket.CLOSING => 2
4. WebSocket.CLOSED => 3

类属性

1. WebSocket.binaryType：传输数据的类型，值有 DOMSting、Blob、Arraybuffer
2. WebSocket.bufferedAmount：使用 WebSocket.send()发送的数据的字节长度，此时的数据在队列当中，还没有被发送出去，一旦发送出去，这个属性会被重置为 0，当 WebSocket 挂掉时，这个数据不会被重置为 0
