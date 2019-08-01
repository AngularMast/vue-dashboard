import Vue from "vue";
import VueAzureUploader from 'vue-azure-blob-upload'

import App from "./App.vue";
import router from "./router/";
import store from "./store/";
import Axios from "axios";

import AuthPlugin from "./plugins/auth";


Vue.use(AuthPlugin);
import VuetifyGoogleAutocomplete from 'vuetify-google-autocomplete';
import "./registerServiceWorker";
import "./plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "font-awesome/css/font-awesome.css";

import Datetime from 'vue-datetime'
// You need a specific loader for CSS files
import 'vue-datetime/dist/vue-datetime.css'
 
Vue.use(Datetime)

Vue.config.productionTip = false;
Vue.prototype.$http = Axios;
const token = localStorage.getItem("token");
if (token) {
  Vue.prototype.$http.defaults.headers.common["Authorization"] = token;
}

// Vue.prototype.$http.defaults.headers.common["Accept"] = "application/json";
// Vue.prototype.$http.defaults.headers.common["Content-Type"] =
//   "application/x-www-form-urlencoded";

Vue.use(VuetifyGoogleAutocomplete, {
  apiKey: 'AIzaSyCpJOWuQiXHTAnmdxgqjPRCwOKkTllFtsg',
});
Vue.use(VueAzureUploader);


new Vue({
  router,
  store,
  render: h => h(App),
  created() {
    //ctm-api
  }
}).$mount("#app");
