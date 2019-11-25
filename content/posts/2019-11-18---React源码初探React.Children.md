---
title: React.Children源码分析
date: "2019-11-18"
template: "post"
slug: "/post/understand-reactChildred/"
category: "React"
tags: 
    - "react"
    - "web 框架"
description: " 在React.CreateElement方法中，我们知道props.chidren属性的类型不是固定的，所以我们不能在组件内部直接使用数组方法遍历children属性，需要使用React.Children中提供的方法才能遍历。"
socialImage: "/media/42-line-bible.jpg"
---

在React.CreateElement方法中，我们知道props.chidren属性的类型不是固定的，所以我们不能在组件内部直接使用数组方法遍历children属性，需要使用React.Children中提供的方法才能遍历。以forEach为剖析点，深入的了解下是怎么实现遍历chilren的以及有设计思想是值得我们去借鉴的。下面这段话引用react官网。
![react-children.jpg](/media/react-children.jpg)

```
/**
 * @param {?*} children 需要遍历的children树
 * @param {function(*, int)} 回调函数
 * @param {*} 回调函数执行上下文
 */
function forEachChildren(children, forEachFunc, forEachContext) {
  if (children == null) {
    return children;
  }
  var traverseContext = getPooledTraverseContext(null, null, forEachFunc, forEachContext);
  traverseAllChildren(children, forEachSingleChild, traverseContext);
  releaseTraverseContext(traverseContext);
}
```
调用了getPooledTraverseContext，第一次初始化的时候返回一个对象给我们。
```
const POOL_SIZE = 10;
const traverseContextPool = [];
function getPooledTraverseContext(mapResult, keyPrefix, mapFunction, mapContext) {
  // 首次进来 traverseContextPool为空
  if (traverseContextPool.length) {
    var traverseContext = traverseContextPool.pop();
    traverseContext.result = mapResult;
    traverseContext.keyPrefix = keyPrefix;
    traverseContext.func = mapFunction;
    traverseContext.context = mapContext;
    traverseContext.count = 0;
    return traverseContext;
  } else {
    return {
      result: mapResult,
      keyPrefix: keyPrefix,
      func: mapFunction,
      context: mapContext,
      count: 0
    };
  }
}
/* 
  初始化的时候返回了一个对象
{
  result: null,
  keyPrefix: null,
  func: forEachFunc,
  context: undefined
  count: 0
}
*/
```
traverseAllChildren传递children，forEachSingleChild，traverseContext。forEachSingleChild函数里面其实就是调用了forEach传进来的回调函数，以及上下文执行环境。
```
function forEachSingleChild(bookKeeping, child, name) {
  var func = bookKeeping.func,
      context = bookKeeping.context;
  func.call(context, child, bookKeeping.count++);
}
```
```
function traverseAllChildren(children, callback, traverseContext) {
  if (children == null) {
    return 0;
  }

  return traverseAllChildrenImpl(children, '', callback, traverseContext);
}
```
traverseAllChildrenImpl 主要判断传进来的children是什么类型，如果是字符串，数字，对象类型并且children.$$typeof是
REACT_ELEMENT_TYPE或者REACT_PORTAL_TYPE，就会去执行forEachSingleChild，如果传进来的是一个数组对象，那么就会遍历这个数组对象并且递归调用traverseAllChildrenImpl再去执行回调函数。
```
function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
  var type = typeof children;
  // 判断children类型
  if (type === 'undefined' || type === 'boolean') {
    children = null;
  }
  // 定义一个变量表示是否执行回调函数
  var invokeCallback = false;
  // children 为null，string，number，合法的react元素 invokeCallback为true，执行回调
  if (children === null) {
    invokeCallback = true;
  } else {
    switch (type) {
      case 'string':
      case 'number':
        invokeCallback = true;
        break;

      case 'object':
        switch (children.$$typeof) {
          case REACT_ELEMENT_TYPE:
          case REACT_PORTAL_TYPE:
            invokeCallback = true;
        }

    }
  }
  if (invokeCallback) {
    //执行回调
    callback(traverseContext, children,
    // If it's the only child, treat the name as if it was wrapped in an array
    // so that it's consistent if the number of children grows.
    nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar);
    return 1;
  }

  var child;
  var nextName;
  var subtreeCount = 0; // Count of children found in the current subtree.

  var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

  // children是数组，遍历数组，再次执行traverseAllChildrenImpl
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      nextName = nextNamePrefix + getComponentKey(child, i);
      subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
    }
  }
  return subtreeCount;
}
```
当forEach执行完毕之后，释放traverseContext，并且往traverseContextPool里push traverseContext。traverseContextPool作用在于维护一个对象池，当有需要的时候就从这里面取出对象，用完了还回来。React.Children属性下提供了
很多方法，如果没有traverseContextPool维护 traverseContext，每次调用的话就会频繁的创建traverseContext，造成内存抖动。所以我们用一个对象池来防止内存抖动。
```
// 遍历完毕，返还traverseContext
function releaseTraverseContext(traverseContext) {
  traverseContext.result = null;
  traverseContext.keyPrefix = null;
  traverseContext.func = null;
  traverseContext.context = null;
  traverseContext.count = 0;
  if (traverseContextPool.length < POOL_SIZE) {
    traverseContextPool.push(traverseContext);
  }
}
```
总结：   
1.  在react组件中不能使用数组方法遍历children属性。
2.  使用一个对象池来维护对象，防止内存抖动。
3.  forEach方法内部循环遍历数组，并且调用回调函数传入参数。