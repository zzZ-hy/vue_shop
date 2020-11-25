import Vue from 'vue'
import Router from 'vue-router'

// import Login from './components/Login'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ './components/Login')
// import Home from './components/Home'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ './components/Home')
// import Welcome from "./components/Welcome";
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ './components/Welcome')
// import Users from "./components/user/Users";
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ './components/user/Users')
// import Rights from "./components/power/Rights";
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ './components/power/Rights')
// import Roles from "./components/power/Roles";
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ './components/power/Roles')

// import Cate from "./components/goods/Cate";
const Cate = () => import(/* webpackChunkName: "cate_params" */ './components/goods/Cate')
// import Params from "./components/goods/Params";
const Params = () => import(/* webpackChunkName: "cate_params" */ './components/goods/Params')

// import GoodsList from "./components/goods/List";
const GoodsList = () => import(/* webpackChunkName: "goodsList_goodsAdd" */ './components/goods/List')
// import GoodsAdd from "./components/goods/Add";
const GoodsAdd = () => import(/* webpackChunkName: "goodsList_goodsAdd" */ './components/goods/Add')

// import Order from "./components/order/Order";
const Order = () => import(/* webpackChunkName: "order_report" */ './components/order/Order')
// import Report from "./components/report/Report";
const Report = () => import(/* webpackChunkName: "order_report" */ './components/report/Report')

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
        {path: '/users', component: Users},
        {path: '/rights', component: Rights},
        {path: '/roles', component: Roles},
        {path: '/categories', component: Cate},
        {path: '/params', component: Params},
        {path: '/goods', component: GoodsList},
        {path: '/goods/add', component: GoodsAdd},
        {path: '/orders', component: Order},
        {path: '/reports', component: Report}
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
