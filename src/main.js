import Vue from 'vue'
import App from './App.vue'
import firebase from "firebase/app"
import "firebase/auth"
import "firebase/database"
import "firebase/storage"

Vue.config.productionTip = false;

// Your web app's Firebase configuration
let firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

new Vue({
  render: h => h(App)
}).$mount("#app");
