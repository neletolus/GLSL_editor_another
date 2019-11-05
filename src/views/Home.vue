<template>
  <div class="home" @mousemove="mouseMove">
    <canvas id="canvas"></canvas>
    <div class="buttons">
      <a href="#" v-on:click="code_compile">run</a>
      <a href="#" v-on:click="code_stop">stop</a>
      <a href="#" v-on:click="code_save">save</a>
      <a href="#" v-on:click="move_frag">フラグメントシェーダ</a>
      <a href="#" v-on:click="move_vert">頂点シェーダ</a>
      <a href="#" v-on:click="move_codes">コード一覧</a>
    </div>
    <div class="radios">
      <input type="radio" id="points" value="points" v-model="picked" />
      <label for="points">points</label>
      <input type="radio" id="board" value="board" v-model="picked" />
      <label for="board">板ポリ</label>

      <br />
    </div>
    <div id="codes" class="codes">
      <div class="code_wrap">
        <a
          class="code_link"
          v-for="(value,index) in codes"
          v-bind:key="value.date"
          href="#"
          v-on:click="changeCode(index)"
        >
          <img :src="value[5]" />
          <p>{{value[3]}} {{value[2]}}</p>
        </a>
      </div>
    </div>
    <div id="input_area" class="input_area">
      <prism-editor id="fragmenttext" v-model="fragment" language="glsl" :line-numbers="true"></prism-editor>
    </div>
    <div id="input_area2" class="input_area">
      <prism-editor id="vertextext" v-model="vertex" language="glsl" :line-numbers="true"></prism-editor>
    </div>
  </div>
</template>
<script>
import * as THREE from "three";
import Stats from "stats.js";
import firebase from "firebase/app";
import PrismEditor from "vue-prism-editor";
import "vue-prism-editor/dist/VuePrismEditor.css";
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
    const vertex = null;
    const codes = [];
    const thumbs = [];
    const stats = null;
    const picked = null;
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
      vertex,
      input: "", //コード
      user: {},
      codes,
      thumbs,
      stats,
      picked
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
    this.vertex =
      "precision mediump float;\n" +
      "uniform float time;\n" +
      "uniform vec2 resolution;\n" +
      "uniform vec2 mouse;\n" +
      "void main(){\n" +
      "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n" +
      "}\n";
    firebase.auth().onAuthStateChanged(user => {
      this.user = user ? user : {};
    });
    this.init();
    this.animate();

    const ref_codes = firebase.database().ref("code");
    let _this = this;
    let storageRef = firebase.storage().ref();

    ref_codes.on("value", function(snapshot) {
      _this.codes.length = 0;
      snapshot.forEach(function(childSnapshot) {
        let value = childSnapshot.val();
        let values = [
          value.code,
          value.code2,
          value.name,
          value.date,
          value.picked
        ];
        storageRef
          .child("images/" + value.thumbnail)
          .getDownloadURL()
          .then(function(url) {
            // `url` is the download URL for 'images/thumbname'

            // This can be downloaded directly:
            let xhr = new XMLHttpRequest();
            xhr.responseType = "blob";
            xhr.onload = function(event) {
              let blob = xhr.response;
            };
            xhr.open("GET", url);
            xhr.send();

            // Or inserted into an <img> element:
            values.push(url);
          })
          .catch(function(error) {
            // Handle any errors
          });
        _this.codes.unshift(values);
      });
    });
  },
  methods: {
    init() {
      this.clock = new THREE.Clock();
      this.time = 0.0;

      this.windowWidth = 512;
      this.windowHeight = 512;
      this.dpr = window.devicePixelRatio;
      this.$canvas = document.getElementById("canvas");
      this.camera = new THREE.PerspectiveCamera(
        70,
        this.windowWidth / this.windowHeight,
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
        vertexShader: this.vertex,
        fragmentShader: this.fragment
      });

      this.model = new THREE.Mesh(this.geometry, this.materialShader);
      this.model.position.y = 150;
      this.scene.add(this.model);
      this.stats = new Stats();
      this.stats.domElement.style.position = "absolute";
      this.stats.domElement.style.top = "530px";
      this.stats.domElement.style.left = "10px";
      this.stats.showPanel(0);
      document.body.appendChild(this.stats.dom);

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: this.$canvas,
        preserveDrawingBuffer: true
      });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.debug.checkShaderErrors = true;
      this.renderer.setClearColor(0xf0f0f0);
      this.renderer.setSize(this.windowWidth, this.windowHeight);

      // window.addEventListener("resize", this.onWindowResize, false);
    },
    //一旦閉じとく
    // onWindowResize() {
    //   this.camera.aspect = window.innerWidth / window.innerHeight;
    //   this.camera.updateProjectionMatrix();

    //   this.renderer.setSize(window.innerWidth, window.innerHeight);
    // },
    animate() {
      requestAnimationFrame(this.animate);
      this.render();
      this.stats.update();
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
    code_compile() {
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
        vertexShader: this.vertex,
        fragmentShader: this.fragment,
        vertexColors: true
      });
      this.scene.remove(this.model);
      this.model = null;
      if (this.picked == "points") {
        this.model = new THREE.Points(this.geometry, this.materialShader);
      } else {
        this.model = new THREE.Mesh(this.geometry, this.materialShader);
      }
      this.model.position.y = 150;
      this.scene.add(this.model);
      this.shaderError = document.getElementById("shaderError");
    },
    make_board() {
      this.geometry.dispose();
      let aspect = this.windowWidth / this.windowHeight;

      this.geometry = new THREE.BufferGeometry();

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

      this.index = new Uint32Array([0, 2, 1, 1, 2, 3]);

      this.geometry.addAttribute(
        "position",
        new THREE.BufferAttribute(this.vertices, 3)
      );
      this.geometry.setIndex(new THREE.BufferAttribute(this.index, 1));
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
      this.vertex =
        "precision mediump float;\n" +
        "uniform float time;\n" +
        "uniform vec2 resolution;\n" +
        "uniform vec2 mouse;\n" +
        "void main(){\n" +
        "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n" +
        "}\n";
      this.code_compile();
    },
    make_points() {
      this.geometry.dispose();
      let radius = 200;
      this.geometry = new THREE.BufferGeometry();
      let positions = [];
      let colors = [];
      let sizes = [];
      let color = new THREE.Color();
      for (var i = 0; i < 10000; i++) {
        positions.push((Math.random() * 2 - 1) * radius);
        positions.push((Math.random() * 2 - 1) * radius);
        positions.push((Math.random() * 2 - 1) * radius);
        color.setHSL(i / 10000, 1.0, 0.5);
        colors.push(color.r, color.g, color.b);
        sizes.push(20);
      }
      this.geometry.addAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      this.geometry.addAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3)
      );
      this.geometry.addAttribute(
        "size",
        new THREE.Float32BufferAttribute(sizes, 1).setDynamic(true)
      );
      this.fragment =
        "precision mediump float;\n" +
        "varying vec3 vColor;\n" +
        "void main() {\n" +
        "gl_FragColor = vec4( vColor, 1.0 );\n" +
        "gl_FragColor = gl_FragColor;\n" +
        "}";
      this.vertex =
        "precision mediump float;\n" +
        "attribute float size;\n" +
        "varying vec3 vColor;\n" +
        "void main() {\n" +
        "vColor = color;\n" +
        "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n" +
        "gl_PointSize = size * ( 100.0 / -mvPosition.z );\n" +
        "gl_Position = projectionMatrix * mvPosition;\n" +
        "}\n";
      this.code_compile();
    },
    code_stop() {
      this.materialShader.dispose();
      this.scene.remove(this.model);
      this.model = null;
    },
    code_save() {
      let codeName = prompt("Please input your shader title.");

      if (codeName == null) {
      } else {
        this.doSend(codeName);
      }
    },
    doSend(codeName) {
      if (this.user.uid && this.fragment.length) {
        if (codeName == "") {
          codeName = this.user.displayName + "さんのコード";
        }

        let storageRef = firebase.storage().ref();
        let thumbName = Date.now();
        this.$canvas.toBlob(
          function(blob) {
            let thumb = new Image();
            thumb.src = blob;
            let uploadTask = storageRef.child("images/" + thumbName).put(blob);
          },
          "image/jpeg",
          0.1
        );

        // firebase にメッセージを追加
        firebase
          .database()
          .ref("code")
          .push({
            code: this.fragment,
            code2: this.vertex,
            name: codeName,
            date: this.formatDate(new Date(), "YYYY/MM/DD/hh:mm"),
            picked: this.picked,
            thumbnail: thumbName
          });
      } else {
        alert("ログインしてコードを書いてください");
      }
    },
    changeCode(index) {
      document.getElementById("codes").classList.remove("active");

      let changeHistory = this.codes[index][0];
      let changeHistory2 = this.codes[index][1];
      console.log(this.codes[index]);

      this.fragment = changeHistory;
      this.vertex = changeHistory2;
      this.picked = this.codes[index][4];
      this.code_compile();
    },
    move_frag() {
      document.getElementById("codes").classList.remove("active");
      document.getElementById("input_area2").classList.remove("active");
      document.getElementById("input_area").classList.remove("hidden");
    },
    move_codes() {
      document.getElementById("codes").classList.add("active");
    },
    move_vert() {
      document.getElementById("codes").classList.remove("active");

      document.getElementById("input_area2").classList.add("active");
      document.getElementById("input_area").classList.add("hidden");
    },
    /**
     * 日付をフォーマットする
     * @param  {Date}   date     日付
     * @param  {String} [format] フォーマット
     * @return {String}          フォーマット済み日付
     */
    formatDate(date, format) {
      if (!format) format = "YYYY-MM-DD hh:mm:ss.SSS";
      format = format.replace(/YYYY/g, date.getFullYear());
      format = format.replace(/MM/g, ("0" + (date.getMonth() + 1)).slice(-2));
      format = format.replace(/DD/g, ("0" + date.getDate()).slice(-2));
      format = format.replace(/hh/g, ("0" + date.getHours()).slice(-2));
      format = format.replace(/mm/g, ("0" + date.getMinutes()).slice(-2));
      format = format.replace(/ss/g, ("0" + date.getSeconds()).slice(-2));
      if (format.match(/S/g)) {
        var milliSeconds = ("00" + date.getMilliseconds()).slice(-3);
        var length = format.match(/S/g).length;
        for (var i = 0; i < length; i++)
          format = format.replace(/S/, milliSeconds.substring(i, i + 1));
      }
      return format;
    }
  },
  watch: {
    picked: function() {
      if (this.picked == "points") {
        this.make_points();
      } else if (this.picked == "board") {
        this.make_board();
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.home {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: black;
  .buttons {
    z-index: 90;
    position: absolute;
    width: 100%;
    height: auto;
    top: 0px;
    left: 542px;
    display: flex;
    justify-content: flex-start;
    a {
      position: relative;
      display: block;
      width: auto;
      height: auto;
      padding: 5px 10px;
      background-color: rgba(255, 255, 255, 0.5);
      margin-right: 10px;
      text-decoration: none;
      color: black;
      transition: all 0.3s;
      text-align: center;
    }
    a:hover {
      background-color: white;
    }
    @media screen and(max-width: 767px) {
      width: 100%;
      height: 50px;
      display: flex;
      left: 0px;
      overflow-y: scroll;
      white-space: nowrap;
    }
  }
  .codes {
    overflow-y: auto;
    z-index: 99;
    position: absolute;
    width: 0%;
    height: calc(100vh - 130px);
    top: 50px;
    right: 0;
    background-color: rgba(0, 0, 0, 0.7);
    transition: all 0.3s;
    visibility: hidden;
    .code_wrap {
      padding-top: 50px;
      position: relative;
      max-width: 1200px;
      width: 100%;
      height: auto;
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      margin: auto;
    }
    .code_link {
      text-decoration: none;
      color: black;
      display: block;
      width: 200px;
      height: 150px;
      margin: 20px;
      img {
        display: block;
        width: 100px;
        height: 100px;
        object-fit: cover;
        background-color: gray;
        margin: auto;
      }
      p {
        padding-top: 10px;
        font-size: 15px;
        line-height: 20px;
        color: white;
        height: 40px;
        overflow: hidden;
      }
    }
    &.active {
      width: calc(100% - 512px);
      visibility: visible;
    }
  }
  .input_area {
    z-index: 90;
    position: fixed;
    top: 50px;
    left: 512px;
    width: 100%;
    height: calc(100vh - 130px);
    display: block;
    #fragmenttext {
      display: flex;
      overflow-y: scroll;
    }
    &.hidden {
      display: none;
    }
  }
  #input_area2 {
    display: none;
    width: 0%;
    &.active {
      display: block;
      width: 100%;
    }
  }
  .radios {
    position: absolute;
    left: 30px;
    top: 600px;
    color: white;
    background-color: rgba(255, 255, 255, 0.5);
    label {
      margin-right: 10px;
    }
  }
}
</style>

