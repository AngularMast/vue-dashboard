import Vue from "vue";
import VueAzureUploader from 'vue-azure-blob-upload'
import Axios from "axios";
import Datetime from 'vue-datetime'
import VuetifyGoogleAutocomplete from 'vuetify-google-autocomplete';

import App from "./App.vue";
import router from "./router/";
import store from "./store/";
import AuthPlugin from "./plugins/auth";
import "./registerServiceWorker";
import "./plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "font-awesome/css/font-awesome.css";
import 'vue-datetime/dist/vue-datetime.css'
 
Vue.use(AuthPlugin);
Vue.use(Datetime)
 
Vue.config.productionTip = false;
Vue.prototype.$http = Axios; 
const token = localStorage.getItem("token");
 
if (token) {
  Vue.prototype.$http.defaults.headers.common["Authorization"] = token;
} 

Vue.use(VuetifyGoogleAutocomplete, {
  apiKey: 'AIzaSyCpJOWuQiXHTAnmdxgqjPRCwOKkTllFtsg',
});
Vue.use(VueAzureUploader);


new Vue({
  router,
  store,
  render: h => h(App),
  created() {
  }
}).$mount("#app");
