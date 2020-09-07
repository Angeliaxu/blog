---
title: Vue Keep-alive源码解读
date: "2019-12-08"
template: "post"
draft: false
slug: "/post/vueofkeepalive/"
category: "Vue"
tags:
  - "Vue"
description: "在Vue中，需要保存组件的状态，在切换回之前组件的时候，该组件还是上一次渲染时的效果，这时候就需要vue提供的keep-alive组件来进行包裹。为什么keep-alive具有这种功能呢？接下来就看看keep-alive的内部实现。"
socialImage: "/media/42-line-bible.jpg"
---

在 Vue 中，需要保存组件的状态，在切换回之前组件的时候，该组件还是上一次渲染时的效果，这时候就需要 vue 提供的 keep-alive 组件来进行包裹。keep-alive 一般用来包裹动态组件`<component/>`和路由组件`<router-view/>`。

接下来看 keep-alive 的实现，其中缓存组件主要是在 render 函数中。

```
export default {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  created () {
      // cache缓存组件
    this.cache = Object.create(null)
        // 缓存组件标识集合
    this.keys = []
  },
    // keep-alive 销毁后，清除cache和keys里面缓存的组件和标识
  destroyed () {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted () {
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },
    // render函数每次都会触发
  render () {
      // 获取被keep-alive包括的组件
    const slot = this.$slots.default
    //  组件的vnode
    const vnode: VNode = getFirstComponentChild(slot)
    // 是有效的vnode
    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // check pattern
      const name: ?string = getComponentName(componentOptions)
      const { include, exclude } = this
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      const { cache, keys } = this
      // 生成key值
      const key: ?string = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
        // 如果当前组件被缓存过，直接从缓存里面拿组件实例
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        remove(keys, key)
        keys.push(key)
      } else {
          // 初次缓存
        cache[key] = vnode
        keys.push(key)
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }

      vnode.data.keepAlive = true
    }
    return vnode || (slot && slot[0])
  }
}
```

总结：
keep-alive 主要使用 LRU （最近使用原则）算法来实现缓存组件：主要思想是：在缓存一定的情况下，加入新的东西置换出最近未使用的页面，下面是对 LRU 的具体实现。

```
  function LRU(size) {
      this.map = new Map();
      this.size = size;
  }
  LRU.prototype.add = function (key, value) {
    if (this.map.size > this.size) {
      // 超出缓存限制，删除不常用的key
      this.map.delete(this.map.keys().next().value);
    }
    this.map.set(key, value);
  };
  LRU.prototype.get = function (key) {
    if (!this.map.has(key)) {
      return -1;
    }
    let value = this.map.get(key);
    this.map.delete(key);
    this.map.set(ket, value);
    return value;
  };
```
