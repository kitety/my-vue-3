import {isFunction} from "@vue/shared";
import {ReactiveEffect, trackEffect, triggerEffect} from "./effect";

// 对象 属性 effect
// effect
class ComputedRefImpl {
    public effect
    public _dirty = true
    public dep = new Set()

    constructor(getter: Function, public setter: Function | undefined) {
        this.effect = new ReactiveEffect(getter, () => {
            console.log('computed effect')
            // 依赖的值变了，就设置为true
            if (!this._dirty) {
                this._dirty = true
                // 依赖的值发生变化，应给触发更新
                triggerEffect(this.dep)
            }
        })
    }

    public _value

    get value() {
        // 取值的时候也要做依赖收集，联动更新
        // 在effect使用的，要做依赖收集
        trackEffect(this.dep)

        // dirty 实现缓存
        if (this._dirty) {
            this._dirty = false
            // _value就是取值后的结果
            this._value = this.effect.run()
        }

        return this._value
    }

    set value(newValue) {
        this.setter(newValue)
    }
}

export function computed(getterOrOptions) {
    let getter;
    let setter;
    const isGetter = isFunction(getterOrOptions)
    if (isGetter) {
        getter = getterOrOptions
        setter = () => {
            console.log('computed not set value')
        }
    } else {
        getter = getterOrOptions.get
        setter = getterOrOptions.set
    }
    console.log({getter, setter})

    return new ComputedRefImpl(getter, setter)
}
