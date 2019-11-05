<template>
  <header id="header">
    <!-- ログイン時にはフォームとログアウトボタンを表示 -->
    <div class="login_form" v-if="user.uid" key="login">
      <img class="login_img" :src="user.photoURL" />
      <a href="#" type="button" @click="doLogout">ログアウト</a>
    </div>
    <!-- 未ログイン時にはログインボタンを表示 -->
    <div class="login_form" v-else key="logout">
      <a href="#" type="button" @click="doLogin">ログイン</a>
    </div>
  </header>
</template>

<script>
import firebase from "firebase/app";

export default {
  props: ["codeData"],
  data() {
    return {
      user: {}
    };
  },
  created() {
    firebase.auth().onAuthStateChanged(user => {
      this.user = user ? user : {};
      console.log(user.displayName);
    });
  },
  methods: {
    // ログイン処理
    doLogin() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider);
    },
    // ログアウト処理
    doLogout() {
      firebase.auth().signOut();
    }
  }
};
</script>

<style lang="scss" scoped>
#header {
  position: absolute;
  top: 0;
  z-index: 999;
  width: auto;
  height: 30px;
  right: 30px;
  top: 30px;
  .login_form {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    a {
      height: 20px;
      background-color: white;
      padding: 5px;
      text-decoration: none;
      color: black;
    }
    .login_img {
      width: 50px;
      height: 50px;
      border-radius: 100%;
      margin-right: 10px;
    }
  }
}
</style>