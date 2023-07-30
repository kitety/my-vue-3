export let activeEffect = null

// 在收集的列表中，将自己移除
function cleanupEffect(effect: ReactiveEffect) {
    const {deps} = effect
    console.log(deps)
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

    // 默认将fn挂载到实例上
    constructor(private fn: Function) {
    }

    /**
     * activeEffect 可以用栈来处理循环嵌套的情况
     * 也可以标记父子关系
     */
    run() {
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

    }
}

export function effect(fn: Function) {
    // 创建一个响应式effect，并且让effect执行
    const _effect = new ReactiveEffect(fn);
    _effect.run();

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
        let deps = depsMap.get(key)
        // 没有 set
        if (!deps) {
            depsMap.set(key, (deps = new Set()))
        }
        // 3. 将当前的activeEffect存到set中 需要看下有没有这个effect
        let shouldTrack = !deps.has(activeEffect)
        if (shouldTrack) {
            deps.add(activeEffect)
            activeEffect.deps.push(deps)
        }
        /**
         * name -- Set effect
         * age -- Set effect
         * 可以通过当前的effect，找到这两个几何中的自己，将其移除
         */
        // console.log(targetMap)
    }
}

// 通过对象上的属性，找到effect，让这个effect重新执行
export function trigger(target, key, newValue, oldValue) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;
    const dep = depsMap.get(key); // name-> [effect1,effect2] 对应的effect
    // 需要拷贝一份 不要操作同一个对象，参考test2
    // 运行的是数组，参数的是set
    const effects = [...dep]
    if (dep) {
        effects.forEach(effect => {
            // 不断运行自己没有意义
            if (effect !== activeEffect) {
                console.log('effect running',)
                effect.run()
            }
        })
    }

}
