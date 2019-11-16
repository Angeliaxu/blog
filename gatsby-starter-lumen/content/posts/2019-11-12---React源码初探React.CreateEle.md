---
title: React.createElement源码分析
date: "2019-11-12"
template: "post"
slug: "/post/understand-reactCreateElement/"
category: "React"
tags: 
    - "react"
    - "web 框架"
description: " React作为UI层，让开发人员可以模块化的编写UI库，达到模块复用的目的，React写UI的时候，在出现Hooks之前需要考虑此组件是否需要进行内部状态管理，若需要，推荐使用class的方式，若不需要，推荐使用无状态组件方式。"
socialImage: "/media/42-line-bible.jpg"
---

React作为UI层，让开发人员可以模块化的编写UI库，达到模块复用的目的，在React写UI的时候，出现Hooks之前需要考虑此组件是否需要进行内部状态管理，若需要，推荐使用class的方式，若不需要，推荐使用无状态组件方式。Hooks之后，在无状态函数式组件里面我们也能进行内部状态管理。不论是哪种方式来写React，都需要深入源码到底React是怎么样实现，废话不多说，直接上马（码）吧！
```
function x() {
    return (
        <div className="box">
            <span>
                <em>title</em>
            </span>
            <div>1111</div>
      </div>  
    )
}
```
通过babel会被转义成
```
"use strict";
function x() {
    return React.createElement(
        "div", 
        { className: "box"}, 
        React.createElement(
            "span", 
            null,
            React.createElement("em", null, "title”)
        ), 
        React.createElement("div", null, "1111")
    );
}
   
```
JSX语法糖被转义成了调用React.createElement这个方法来创建元素。看一下createElement实现的方法
```
// type 元素类型, config 包含属性的对象,children 子元素
function createElement(type, config, children) {
  let propName;
  // 存放props
  const props = {};
  let key = null;
  let ref = null;
  let self = null;
  let source = null;

  // 设置属性， 把config里面的属性给到props里面
  if (config != null) {
    // 赋值特殊的属性： ref和key
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      // react dom diff  加上这个 key
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // 遍历 属性
    for (propName in config) {
      // 过滤掉特殊属性
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }
  
  // 往props里面添加children，children可能不止一个，子节点个数，挂载在props下children属性。去除掉前两位
  // 所以props的children属性可能是一个对象，可能是一个数组
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  //defaultProps是给组件设置默认props Default Prop Values，这些默认的props也会存放在props这个对象里面
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  // 返回一个react element
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props,
  );
}
```
小结： React.createElement里面做了哪些事儿？  
   1. 声明一个props对象用来存放属性，defaultProps，以及孩子节点。
   2. 孩子节点存放在children属性里面，children可以是一个对象，可以是一个数组，取决于传入的孩子节点个数。
   3. 判断组件上是否有ref属性或者key属性，无为null。 
   4. 返回一个ReactElement

接着来看下ReactElement这个函数做了哪些事情？
```
const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,
    // Record the component responsible for creating this element.
    _owner: owner,
  };
  return element;
};
```
纳尼？就只多了一个$$typeof属性   
> This tag allows us to uniquely identify this as a React Element   
> 翻译过来是这个属性是唯一识别这个元素是ReactElement的标识。

看一下$$typeof是什么？
```
const REACT_ELEMENT_TYPE = hasSymbol
  ? Symbol.for('react.element')
  : 0xeac7;
```
**为什么有$$typeof属性？**  

![42-line-bible.jpg](/media/typeof.jpg)

上面这张图片摘自Dan Abramov写的[Why Do React Elements Have a $$typeof Property?](https://overreacted.io/why-do-react-elements-have-typeof-property/) 大致的意思是在React0.13版本当中存在能被XSS攻击的漏洞，这个漏洞存在的前提条件是服务端存在漏洞。用户在服务端存储json文件包含恶意代码，发送到客户端解析，会造成XSS攻击。为了解决这个漏洞，所以加上$$typeof属性，服务端发送一个包含$$typeof属性的json，到客户端解析时，$$typeof不会被解析出来（**Symbol类型不会被json解析**），React内部判断这不是一个合法的ReactElement，也就不会渲染。降低了XSS攻击的可能性。 

使用React.isValidElement判断元素是否是一个合法的ReactElement，核心也是通过判断$$typeof。
```
function isValidElement(object) {
  return (
    typeof object === 'object' &&
    object !== null &&
    object.$$typeof === REACT_ELEMENT_TYPE
  );
}
```
小结：
1.  JSX是ReactCreateElement的语法糖。
2.  在写函数式组件时需要在头部引入React。
3.  为什么写JSX语法的时候顶部元素只能是一个而不是多个，是因为ReactCreateElement这个方法的实现。