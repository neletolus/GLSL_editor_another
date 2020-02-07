<template>
  <div id="app">
    <HeaderItem></HeaderItem>
    <Home></Home>
  </div>
</template>

<script>
import HeaderItem from "./components/Header";
import Home from "./views/Home";

export default {
  name: "app",
  components: {
    HeaderItem,
    Home
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

