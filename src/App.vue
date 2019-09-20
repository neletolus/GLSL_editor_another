<template>
  <div id="app">
    <HeaderItem></HeaderItem>
    <router-view></router-view>
  </div>
</template>

<script>
import HeaderItem from "./components/Header";

export default {
  name: "app",
  components: {
    HeaderItem
  },
  methods: {}
};
</script>


<style lang="scss">
* {
  margin: 0;
  padding: 0;
}
html,
body {
  overflow: hidden;
}
</style>

