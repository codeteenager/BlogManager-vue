import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/newPage',
      component: require('@/components/NewPage').default
    },
    {
      path: '/',
      component: require('@/components/Main').default
    }
  ]
})
