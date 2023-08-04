export let activeEffect = null

// 在收集的列表中，将自己移除
// 一定要清除，不然会执行很多次
function cleanupEffect(effect: ReactiveEffect) {
    const {deps} = effect
    // 需要处理set
    for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect)
    }
    effect.deps.length = 0

}

export class ReactiveEffect {
    parent = undefined
    // 依赖了哪些effect ，Set list
    deps = []
    // active状态
    active = true

    // 默认将fn挂载到实例上
    // public 实例上
    constructor(private fn: Function, public scheduler?: Function) {
    }

    /**
     * activeEffect 可以用栈来处理循环嵌套的情况
     * 也可以标记父子关系
     */
    run() {
        if (!this.active) {
            // 不是激活状态，直接执行fn
            // 不会发生依赖收集
            return this.fn();
        }

        try {
            this.parent = activeEffect;
            // 标记当前正在执行的effect
            activeEffect = this
            cleanupEffect(this)// 清空上一次的依赖
            // fn 执行 ，触犯依赖收集，因此执行之前清理
            return this.fn();
        } finally {
            // 执行完毕后，将activeEffect恢复成上一个effect
            activeEffect = this.parent
            this.parent = undefined
        }

    }

    stop() {
        if (this.active) {
            // 目前激活，那就停止依赖收集
            this.active = false
            // 清除依赖
            cleanupEffect(this)
        }
    }
}

export function effect(fn: Function, options: any = {}) {
    // 创建一个响应式effect，并且让effect执行
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    // 处理this，返回runner方法给用户，用户可以调用
    const runner = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner

}

// weakMap map set
// {name:'zf',age:12} 'name'-- [effect1,effect2]
const targetMap = new WeakMap();


// 让对象的这个属性收集 记录当前的activeEffect
export function track(target, key) {
    if (activeEffect) {
        // 1. 先根据对象取值，找到map
        let depsMap = targetMap.get(target)
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()))
        }
        // 2. 在根据对象的属性取值，找到set
        let dep = depsMap.get(key)
        // 没有 set
        if (!dep) {
            depsMap.set(key, (dep = new Set()))
        }
        // 这个key在这个effect中使用
        trackEffect(dep)
    }
}

export function trackEffect(dep: Set<any>) {
    if (!activeEffect) return;
    // 3. 将当前的activeEffect存到set中 需要看下有没有这个effect
    let shouldTrack = !dep.has(activeEffect)
    if (shouldTrack) {
        dep.add(activeEffect)
        /**
         * name -- Set effect
         * age -- Set effect
         * 可以通过当前的effect，找到这两个几何中的自己，将其移除
         */
        activeEffect.deps.push(dep)
    }
}

// 通过对象上的属性，找到effect，让这个effect重新执行
export function trigger(target, key, newValue, oldValue) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;
    const dep = depsMap.get(key); // name-> [effect1,effect2] 对应的effect
    triggerEffect(dep)
}

export function triggerEffect(dep: Set<any>) {
    // 需要拷贝一份 不要操作同一个对象，参考test2
    // 运行的是数组，参数的是set
    if (dep) {
        const effects = [...dep];
        effects.forEach(effect => {
            // 不断运行自己没有意义,只有当不是当前的effect的时候，才需要执行
            if (effect !== activeEffect) {
                // 用户传递了更新函数，就执行更新函数
                if (effect.scheduler) {
                    effect.scheduler()
                } else {
                    // 用户没有传递了更新函数，默认执行effect
                    effect.run()
                }
            }
        })
    }
}
