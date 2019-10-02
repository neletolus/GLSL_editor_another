<template>
  <header id="header">
    <nav id="header-nav">
      <ul>
        <!-- <router-link to="/" tag="li" id="home-nav">
          <a>ホーム</a>
        </router-link>
        <router-link tag="li" id="codes-nav" to="/codes">
          <a>コード一覧</a>
        </router-link>-->
      </ul>
    </nav>
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
  width: 100%;
  height: 50px;

  .login_form {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    justify-content: flex-start;
    vertical-align: middle;
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