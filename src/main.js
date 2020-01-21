import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import VueGoogleApi from 'vue-google-api'

Vue.config.productionTip = false

const config = {
  apiKey: 'AIzaSyBqCP-xgWzm2y5gsk90cl-APUL39FgVrP4',
  clientId:
    '834050956628-9khmjoh5efp45b9flvk8joiqdvee110i.apps.googleusercontent.com',
  scope: 'https://www.googleapis.com/auth/calendar'
}
Vue.use(VueGoogleApi, config)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
