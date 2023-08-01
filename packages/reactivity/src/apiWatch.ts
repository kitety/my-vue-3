import {isReactive} from "./reactive";
import {isFunction, isObject} from "@vue/shared";
import {ReactiveEffect} from "./effect";

// =深拷贝
// seen 防止递归取值，防止死循环
function traverse(value, seen = new Set()) {
    if (!isObject(value)) {
        return value;
    }
    // 如果已经循环了这个对象，再循环会导致死循环
    if (seen.has(value)) {
        return value
    }
    seen.add(value)
    for (const key in value) {
        traverse(value[key], seen)   // 触发属性的getter
    }
    return value
}

export function dowatch(source: object | Function, cb: Function | null, options: object = {}) {
    // 1.source 是个响应式对象
    // 2.source 是个函数

    //effect + scheduler
    let getter;
    if (isReactive(source)) {
        // 注意访问属性，不然不行
        // 取所有的属性
        getter = () => traverse(source)
    } else if (isFunction(source)) {
        getter = source
    }
    let oldValue;
    // 里面的属性就会收集effect
    // 数据变化会执行对应的schedular
    let clear;
    let onCleanUp = (fn: Function) => {
        clear = fn
    }
    const job = () => {
        if (cb) {
            //watch
            // 收集依赖
            const newValue = effect.run();
            // 如果有clean函数的话，就执行
            // 下次执行的时候，将上次的清除掉
            clear?.();
            cb?.(newValue, oldValue, onCleanUp);
            oldValue = newValue
        } else {
            //watchEffect ,只需要run即可
            effect.run()
        }
    }
    const effect = new ReactiveEffect(getter, job)
    // 收集依赖
    oldValue = effect.run();

}

export function watch(source: Function, cb: Function, options: object = {}) {
    return dowatch(source, cb, options)

}

export function watchEffect(source: Function, options: object = {}) {
    return dowatch(source, null, options)
}

// 常见的写法就是监控一个函数的返回值，根据返回值的变化触发对应的操作
// 可以穿一个响应式对象，监控到对象的变化触发回调

//apiWatch=effect 包装，watchEffect=effect


