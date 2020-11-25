module.exports = {
  chainWebpack: config => {
    //  发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')

      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })

      //  控制在生产模式显示的标题和按需加载的cdn
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })

    //  开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')

      //  控制在开发模式显示的标题和按需加载的cdn
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
}
