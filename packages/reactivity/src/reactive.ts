import {isObject} from "@vue/shared";
import {mutableHandlers} from "./handler";

export function reactive(value: object) {
    // reactive 只能处理对象，不是对象不处理
    if (!isObject(value)) {
        return value
    }
    const proxy = new Proxy(value, mutableHandlers)
    return proxy
}
