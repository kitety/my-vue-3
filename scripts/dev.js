const {build} = require('esbuild')
const {resolve} = require('path')

const target = 'reactivity'

build({
    // 入口文件
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    // 打包后的文件
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),
    // 依赖模块全部打包到一起
    bundle: true,
    // 支持调试
    sourcemap: true,
    // 打包格式 esm es6模式
    format: 'esm',
    // 指定平台 浏览器使用
    platform: 'browser',
    // apiWatch
    watch: {
        onRebuild(error, result) {
            //文件变化重新构建
            console.log('rebuild...')
        }
    }
}).then(() => {
    console.log('apiWatch...')

})
