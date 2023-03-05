import Vue from 'vue'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'
import NProgress from 'nprogress'

import App from './App.vue'
import router from './router'
import store from './store'

import 'nprogress/nprogress.css'

// 项目上线时可通过CDN加载element-ui的js和css样式，不用按需引入，减少打包体积
import './plugins/element.js'

import './assets/css/global.less'
import './assets/fonts/iconfont.css'

// 导入富文本编辑器的样式表
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
 

Vue.config.productionTip = false

// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 通过axios请求拦截器，在请求头中添加Authorization字段
axios.interceptors.request.use( config => {
    // console.log('axios 拦截下的请求 -----> ',config)
    config.headers.Authorization = window.sessionStorage.getItem('token')

    // 在request拦截器中展示进度条
    NProgress.start()
    return config
})
// 在response拦截器中隐藏进度条
axios.interceptors.response.use( config => {
    NProgress.done()
    return config
})

Vue.prototype.$http = axios


Vue.component('tree-table', TreeTable)

// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

// 将全局echarts对象挂载到Vue原型对象上
Vue.prototype.$echarts = window.echarts


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
