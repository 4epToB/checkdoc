import Vue from 'vue'
import App from './App.vue'
import Check from './components/Check.vue'
import VueRouter from 'vue-router'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import VueSignaturePad from 'vue-signature-pad';

Vue.use(VueSignaturePad);
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(VueRouter);
Vue.config.devtools = true
Vue.config.productionTip = false
const routes = [
  {path: "/check",
  name:"check",
  component: Check},
];
const router = new VueRouter({
  routes,
  mode: "history",
});
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
