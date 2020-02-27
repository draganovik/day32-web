import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import VueGoogleApi from 'vue-google-api'
import { store } from './store'

Vue.config.productionTip = false
Vue.use(VueGoogleApi, store.state.googleApiConfig)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
