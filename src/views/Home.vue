<template>
  <div class="home" @mousemove="mouseMove">
    <canvas id="canvas"></canvas>
    <p id="vertexShader">
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;
      uniform vec2 mouse;
      void main(){
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    </p>
    <div class="buttons">
      <button v-on:click="frag_compile">run</button>
      <button v-on:click="frag_save">save</button>
      <button v-on:click="hide_code">hide_code</button>
      <button v-on:click="move_home">ホーム</button>
      <button v-on:click="move_codes">コード一覧</button>
    </div>
    <div id="codes" class="codes">
      <a
        v-for="(value,index) in codes"
        v-bind:key="value.date"
        href="#"
        v-on:click="changeCode(index)"
      >{{value[1]}}{{value[2]}}</a>
    </div>
    <div id="input_area" class="input_area">
      <prism-editor id="fragmenttext" v-model="fragment" language="glsl" :line-numbers="true"></prism-editor>
    </div>
  </div>
</template>
<script>
import * as THREE from "three";
import firebase from "firebase/app";
import PrismEditor from "vue-prism-editor";
import "vue-prism-editor/dist/VuePrismEditor.css"; // import the styles
import "@/assets/prism.js";
import "@/assets/prism.css";

export default {
  components: {
    PrismEditor
  },
  name: "home",
  data() {
    const $canvas = {};
    const camera = null;
    const controls = null;
    const scene = null;
    const renderer = null;
    const model = null;
    const materialShader = null;
    const geometry = null;
    const vertices = null;
    const index = null;
    const time = 0.0;
    const clock = null;
    const windowWidth = null;
    const windowHeight = null;
    const dpr = null;
    const mouse = new THREE.Vector2();
    const fragment = null;
    const codes = [];
    return {
      $canvas,
      camera,
      controls,
      scene,
      renderer,
      model,
      materialShader,
      geometry,
      vertices,
      index,
      time,
      clock,
      windowWidth,
      windowHeight,
      dpr,
      mouse,
      fragment,
      input: "", //コード
      user: {},
      codes
    };
  },
  mounted() {
    this.fragment =
      "precision mediump float;\n" +
      "uniform float time;\n" +
      "uniform vec2  mouse;\n" +
      "uniform vec2  resolution;\n" +
      "\n" +
      "void main() {\n" +
      "vec2 st = gl_FragCoord.xy/resolution.xy;\n" +
      "st.x *= resolution.x/resolution.y;\n" +
      "\n" +
      "vec3 color = vec3(st.x,st.y,abs(sin(time)));\n" +
      "\n" +
      "gl_FragColor = vec4(color,1.0);\n" +
      "}\n";
    firebase.auth().onAuthStateChanged(user => {
      this.user = user ? user : {};
    });
    this.init();
    this.animate();

    const ref_codes = firebase.database().ref("code");
    let _this = this;

    ref_codes.on("value", function(snapshot) {
      _this.codes.length = 0;
      snapshot.forEach(function(childSnapshot) {
        let value = childSnapshot.val();
        let values = [value.code, value.name, value.date];
        _this.codes.push(values);
      });
    });
  },
  methods: {
    init() {
      this.clock = new THREE.Clock();
      this.time = 0.0;

      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
      this.dpr = window.devicePixelRatio;
      this.$canvas = document.getElementById("canvas");
      this.camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      this.camera.position.y = 150;
      this.camera.position.z = 1;

      this.scene = new THREE.Scene();

      //横長の前提で
      let aspect = this.windowWidth / this.windowHeight;

      //Geometryを作成
      this.geometry = new THREE.BufferGeometry();

      //頂点座標
      this.vertices = new Float32Array([
        -1.0 * aspect,
        1.0,
        0.0,
        1.0 * aspect,
        1.0,
        0.0,
        -1.0 * aspect,
        -1.0,
        0.0,
        1.0 * aspect,
        -1.0,
        0.0
      ]);

      //頂点インデックス
      this.index = new Uint32Array([0, 2, 1, 1, 2, 3]);

      //頂点座標
      this.geometry.addAttribute(
        "position",
        new THREE.BufferAttribute(this.vertices, 3)
      );
      //頂点のつなげ順
      this.geometry.setIndex(new THREE.BufferAttribute(this.index, 1));

      this.materialShader = new THREE.ShaderMaterial({
        uniforms: {
          time: {
            type: "f",
            value: this.time
          },
          resolution: {
            type: "v2",
            value: new THREE.Vector2(
              this.windowWidth * this.dpr,
              this.windowHeight * this.dpr
            )
          },
          mouse: {
            type: "v2",
            value: this.mouse
          }
        },
        vertexShader: document.getElementById("vertexShader").textContent,
        fragmentShader: this.fragment
      });

      this.model = new THREE.Mesh(this.geometry, this.materialShader);
      this.model.position.y = 150;
      this.scene.add(this.model);

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: this.$canvas
      });
      this.renderer.debug.checkShaderErrors = true;
      this.renderer.setClearColor(0xf0f0f0);
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      window.addEventListener("resize", this.onWindowResize, false);
    },
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.render();
    },
    render() {
      this.time = this.clock.getElapsedTime();
      this.model.material.uniforms.time.value = this.time;
      this.model.material.uniforms.mouse.value = this.mouse;
      this.renderer.render(this.scene, this.camera);
    },
    mouseMove() {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    },
    frag_compile() {
      let existedMarkers = document.querySelectorAll(".error_marker");
      for (let index = 0; index < existedMarkers.length; index++) {
        existedMarkers[index].remove();
      }
      this.materialShader.dispose();
      this.materialShader = new THREE.ShaderMaterial({
        uniforms: {
          time: {
            type: "f",
            value: this.time
          },
          resolution: {
            type: "v2",
            value: new THREE.Vector2(
              this.windowWidth * this.dpr,
              this.windowHeight * this.dpr
            )
          },
          mouse: {
            type: "v2",
            value: this.mouse
          }
        },
        vertexShader: document.getElementById("vertexShader").textContent,
        fragmentShader: this.fragment
      });
      this.scene.remove(this.model);
      this.model = null;
      this.model = new THREE.Mesh(this.geometry, this.materialShader);
      this.model.position.y = 150;
      this.scene.add(this.model);
      this.shaderError = document.getElementById("shaderError");
    },
    frag_save() {
      this.doSend();
    },
    doSend() {
      if (this.user.uid && this.fragment.length) {
        // firebase にメッセージを追加
        firebase
          .database()
          .ref("code")
          .push({
            code: this.fragment,
            name: this.user.displayName,
            date: Date.now()
          });
      }
    },
    changeCode(index) {
      document.getElementById("codes").style.display = "none";

      let changeHistory = this.codes[index][0];

      this.fragment = changeHistory;
      this.frag_compile();
    },
    move_home() {
      document.getElementById("codes").style.display = "none";
    },
    move_codes() {
      document.getElementById("codes").style.display = "block";
    },
    hide_code() {
      if (
        document.getElementById("input_area").style.display == "block" ||
        document.getElementById("input_area").style.display == ""
      ) {
        document.getElementById("input_area").style.display = "none";
      } else {
        document.getElementById("input_area").style.display = "block";
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.home {
  position: relative;
  width: 100%;
  height: auto;
  .buttons {
    z-index: 90;
    position: absolute;
    height: 30px;
    top: 80px;
  }
  .codes {
    z-index: 99;
    position: absolute;
    width: 100%;
    height: calc(100vh - 130px);
    top: 130px;
    background-color: white;
    display: none;
    a {
      display: block;
    }
  }
  .input_area {
    z-index: 90;
    position: fixed;
    top: 130px;
    width: 100%;
    height: calc(100vh - 130px);
    background-color: rgba(255, 255, 255, 0.5);
    display: block;
    #fragmenttext {
      display: flex;
      overflow-y: scroll;
    }
  }
}
</style>

