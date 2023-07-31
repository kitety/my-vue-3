import {reactive, ReactiveFlags} from "./reactive";
import {track, trigger} from "./effect";
import {isObject} from "@vue/shared";

export const mutableHandlers = {
    // 读取 state.name
    /**
     * @param target 原对象
     * @param key 属性
     * @param receiver 代理对象 proxy
     */
    // 使用Reflect 解决this问题
    get(target, key, receiver) {
        // 有没有被proxy的标志位
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true
        }
        if (isObject(target[key])) {
            // 取值的时候是对象，再次进行代理，递归变为响应式的，返回代理的结果
            return reactive(target[key])
        }

        const res = Reflect.get(target, key, receiver)
        // 依赖收集 记录属性和effect关系
        console.log('get', key)
        track(target, key)
        // 取值的时候，让属性和effect产生关系
        return res
    },
    // 更新
    set(target: object, key: string | symbol, value: any, receiver: any): boolean {
        let oldValue = target[key]
        // console.log('set', key)
        // 更新数据
        // 找到这个属性对应的effect，让他执行
        const r = Reflect.set(target, key, value, receiver)
        // 触发更新
        if (oldValue !== value) {
            trigger(target, key, value, oldValue)
        }
        return r
    }
}
