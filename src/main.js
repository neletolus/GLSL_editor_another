import Vue from 'vue'
import App from './App.vue'
import router from './router'
import firebase from "firebase/app"
import "firebase/auth";
import "firebase/database"

Vue.config.productionTip = false

// Your web app's Firebase configuration
let firebaseConfig = {
  apiKey: "AIzaSyB0llZMyt8HQO1tun7I-CbeFwUrmIagZW0",
  authDomain: "glsl-editor-another.firebaseapp.com",
  databaseURL: "https://glsl-editor-another.firebaseio.com",
  projectId: "glsl-editor-another",
  storageBucket: "",
  messagingSenderId: "566674832794",
  appId: "1:566674832794:web:6c127e8bb4cbde50dfce23"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

