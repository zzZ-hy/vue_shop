import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'

import treeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
import tree from "element-ui/packages/table/src/store/tree";

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//  axios拦截器
axios.interceptors.request.use(config => {
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //在最后必须return config
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table',treeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
