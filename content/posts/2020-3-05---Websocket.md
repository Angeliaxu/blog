---
title: Websocket
date: "2020-03-05"
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
4. 未加密的标识符是 ws，加密则是 wss（运行在 TLS 之上）
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
2. WebSocket.bufferedAmount(只读属性）：使用 WebSocket.send()发送的数据的字节长度，此时的数据在队列当中，还没有被发送出去，一旦发送出去，这个属性会被重置为 0，当 WebSocket 挂掉时，这个数据不会被重置为 0。（假设有一个用户在网很慢的情况下使用我们的程序，此时需要有很多东西想用户传输，用户收不到，这些数据就会缓存在内存中，等待网好的情况下发送给用户）
3. WebSocket.extenstions(只读属性）：服务器选中的扩展值
4. WebSocket.onclose：连接关闭触发的回调
5. WebSocket.onerror：连接遇到错误时触发的回调
6. WebSocket.onmessage：双方接收消息时触发的回调
7. WebSocket.onopen：当 websocket 的 readystate 值为 open 时，触发此回调函数，表示 websocket 可以开始接收和发送消息了
8. WebSocket.protocol(只读属性）：服务器选中的协议值
9. WebSocket.readyState(只读属性）：当前连接的状态
10. WebSocket.url(只读属性）：当前连接的绝对 url 值

方法

1. websocket.close：关闭当前连接
2. websocket.send：传输数据

事件
一旦 webscoket 建立连接，使用 addEventListener 来监听事件

1. close，同 onclose 属性
2. error：同 onerror 属性
3. message：同 onmessage 属性
4. open：同 onopen 属性

### 深入了解 Websocket

![wss.png](/media/wss.png)
上图中包含一次 ws 请求头和返回头，代表的信息有

请求头

1. origin：客户端的原始请求页面 url 信息，服务端可以选择和哪些客户端来进行通信
2. connection：upgrade，表示客户端想要改变通信协议
3. sec-websocket-key：为了安全机制产生的随机字符串
4. sec-websocket-version：websocket 当前协议版本
5. sec-websocket-extensions：与传输的数据相关，浏览器自动的从匹配列表中选择支持的那一个来对数据进行压缩处理

返回头
如果服务端同意通信协议切换到 websocket，那么他应该返回 101 返回码，返回头里面包含了 sec-websocket-accept 和 acceptwebsocket-key，额~ 使用了一种特殊的算法生成的。浏览器通过识别这些个字段与相应的请求头进行匹配。

传输数据类型

1.  text frames：文本信息帧
2.  binary data frames：二进制数据帧
3.  其他

当接收到的是文本数据帧，会被转换为字符串，二进制数据帧，可以转换为 Blob 或者 ArrayBuffer，用户可以使用 socket.buffferType 进行设置

code status

1. 1000：默认值，正常关闭返回的状态码
2. 1006：不能手动设置的返回码，表示连接突然挂掉了就会返回
3. 10001：服务器或者客户端离开，不在当前页面
4. 10009：传输数据太大没办法处理
5. 10011：服务器挂掉

最后附上 ws 的 rfc [ws rfc](https://tools.ietf.org/html/rfc6455)
