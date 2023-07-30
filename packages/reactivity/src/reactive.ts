import {isObject} from "@vue/shared";
import {mutableHandlers} from "./handler";

const reactiveMap = new WeakMap()

export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
}

export function reactive(target: object) {
    // reactive 只能处理对象，不是对象不处理
    if (!isObject(target)) {
        return target
    }
    // 读取 看这个对象是否被代理过，如果被代理过，就返回代理对象即可
    let existProxy = reactiveMap.get(target)
    if (existProxy) {
        return existProxy
    }
    // 如果target有属性，那就是被代理过的，如果没有，就是没有被代理过的
    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target
    }

    // 缓存可以采用映射表 {value->proxy}
    const proxy = new Proxy(target, mutableHandlers)
    // 缓存代理结果
    reactiveMap.set(target, proxy)
    //1. 3.0的时候，会创建一个反向映射表 {proxy->value}
    //2. 目前不用创建，用的方式是，如果这个对象被代理过了，说明已经被proxy拦截过了
    return proxy
}
