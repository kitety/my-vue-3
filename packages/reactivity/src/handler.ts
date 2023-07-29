export const mutableHandlers = {
    // 读取 state.name
    /**
     * @param target 原对象
     * @param key 属性
     * @param receiver 代理对象 proxy
     */
    // 使用Reflect 解决this问题
    get(target, key, receiver) {
        // console.log('get', key)
        // 取值的时候，让属性和effect产生关系
        return Reflect.get(target, key, receiver)
    },
    // 更新
    set(target: object, key: string | symbol, value: any, receiver: any): boolean {
        // console.log('set', key)
        // 更新数据
        // 找到这个属性对应的effect，让他执行
        return Reflect.set(target, key, value, receiver)
    }
}
