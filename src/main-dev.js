import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'

import treeTable from 'vue-table-with-tree-grid'

//  导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//  导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

//  导入nprogress包对应的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//  axios拦截器
//  在request拦截器中显示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  //  展示进度条
  NProgress.start()
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //在最后必须return config
  return config
})

//  在response拦截器中隐藏进度条  NProgress.done()
axios.interceptors.response.use(config => {
  //  隐藏进度条
  NProgress.done()
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', treeTable)

//  将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

//  全局过滤器，过滤时间戳
Vue.filter('dateFormat', (originVal) => {
  const dt = new Date(originVal)

  //  转换为年月日
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  //  转换为时分秒
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
