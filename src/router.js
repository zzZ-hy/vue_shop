import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login'
import Home from './components/Home'
import Welcome from "./components/Welcome";
import Users from "./components/user/Users";

Vue.use(Router)

const router = new Router({
  routes: [
    {path: '/', redirect: '/login'},
    {path: '/login', component: Login},
    {
      path: '/home',
      component: Home,
      redirect: '/home/welcome',
      children: [
        {path: '/home/welcome', component: Welcome},
        {path: '/users', component: Users}
      ]
    }
  ]
})

//  挂载路由导航守卫
router.beforeEach((to, from, next) => {
//  to将要访问的路劲
//  from代表从哪个路劲跳转过来的
//  next是一个函数，表示放行
//      next()表示放行 next('/login')强制跳转
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
