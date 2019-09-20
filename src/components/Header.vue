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
    <div v-if="user.uid" key="login">
      [{{ user.displayName }}]
      <button type="button" @click="doLogout">ログアウト</button>
    </div>
    <!-- 未ログイン時にはログインボタンを表示 -->
    <div v-else key="logout">
      <button type="button" @click="doLogin">ログイン</button>
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
}
</style>