let person = {
    name: "John",
    get aliasName() {
        return this.name //this是person ，取name的时候不经过proxy了，使用reflect就是代理过的了
    },
    set aliasName(value) {
        this.name = value
    }

}
console.log(person.aliasName)
console.log(person.name)

var proxyPerson = new Proxy(person, {
    // 这里的receiver就是 proxyPerson
    get(target, key, receiver) {
        console.log('getKey', key)
        // 注意打印的区别
        return Reflect.get(target, key, receiver)
        // return target[key] // target是person person的aliasName
    },
    set(target, key, value, receiver) {
        console.log('setKey', key)
        return Reflect.set(target, key, value, receiver)
    }
})
// 试图中使用了aliasName，没触发name操作
console.log(proxyPerson.aliasName)
// 页面和数据有对应关系，数据变化更新试图
proxyPerson.name = 'xxx' // name没收集，不会触发试图更新
// 页面使用了aliasName，会有aliasName对应页面，但是没创建name和页面的关系、
// 但是改name应该更新，但是没有更新
// 在获取aliasName的时候，也希望name触发get
proxyPerson.aliasName = '2222'
