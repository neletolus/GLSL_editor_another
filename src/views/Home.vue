<template>
  <div class="home" @mousemove="mouseMove">
    <div id="canvas_wrap" class="canvas_wrap">
      <canvas id="canvas"></canvas>
      <a href="#" v-on:click="onWindowResize">
        <img src="@/assets/img/expand.png" alt />
      </a>
    </div>
    <div class="buttons">
      <a href="#" v-on:click="code_compile">run</a>
      <a href="#" v-on:click="code_stop">stop</a>
      <a href="#" v-on:click="code_save">save</a>
      <a href="#" v-on:click="move_frag">フラグメントシェーダ</a>
      <a href="#" v-on:click="move_codes">コード一覧</a>
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
          <img :src="value[4]" />
          <p>{{value[2]}} {{value[1]}}</p>
        </a>
      </div>
    </div>
    <div id="input_area" class="input_area">
      <prism-editor id="fragmenttext" v-model="fragment" language="glsl" :line-numbers="true"></prism-editor>
    </div>
    <div class="option_area">
      <p>precision float setting</p>
      <div class="option_area_radio">
        <input type="radio" id="lowp" value="lowp" v-model="precision_float" />
        <label for="lowp">lowp</label>
        <input type="radio" id="mediump" value="mediump" v-model="precision_float" />
        <label for="mediump">mediump</label>
        <input type="radio" id="highp" value="highp" v-model="precision_float" />
        <label for="highp">highp</label>
      </div>
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
    const expandJudge = 0;
    const context = null;
    const analyser = null;
    const freqArray = null;
    const spectrum = null;
    const freqData = null;
    const waveArray = null;
    const samples = null;
    const volume = null;
    const midiDevices = [];
    const midiArray = null;
    const midi = null;
    const precision_float = "mediump";
    const audiofirstjudge = 0;
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
      expandJudge,
      context,
      analyser,
      freqArray,
      spectrum,
      freqData,
      waveArray,
      samples,
      volume,
      midiDevices,
      midiArray,
      midi,
      precision_float,
      audiofirstjudge
    };
  },
  mounted() {
    this.midiDevices = {
      inputs: {}
    };
    this.midiArray = new Float32Array(256 * 128);
    this.requestMIDI();
    this.fragment =
      "precision mediump float;\n" +
      "uniform float time;\n" +
      "uniform vec2  mouse;\n" +
      "uniform vec2  resolution;\n" +
      "uniform sampler2D spectrum;\n" +
      "uniform sampler2D samples;\n" +
      "uniform float volume;\n" +
      "\n" +
      "void main() {\n" +
      "vec2 uv = gl_FragCoord.xy / resolution.xy;\n" +
      "vec2 uv2 = gl_FragCoord.xy / resolution.xy;\n" +
      "uv2.y -= .5;\n" +
      "\n" +
      "float freq = texture2D(spectrum, vec2(uv.x, .5)).r;\n" +
      "float wave = texture2D(samples, vec2(uv.x, .5)).r;\n" +
      "\n" +
      "float r = 1. - step(0.1, abs(wave - uv.y));\n" +
      "float g = 1. - step(0.1, abs(freq - uv2.y));\n" +
      "float b = 1. - step(0.1, abs(volume / 255. - uv2.y));\n" +
      "\n" +
      "gl_FragColor = vec4(r, g, b, 1.);\n" +
      "}\n";
    this.vertex =
      "precision " +
      this.precision_float +
      " float;\n" +
      "uniform float time;\n" +
      "uniform vec2 resolution;\n" +
      "uniform vec2 mouse;\n" +
      "void main(){\n" +
      "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n" +
      "}\n";
    firebase.auth().onAuthStateChanged(user => {
      this.user = user ? user : {};
    });

    const ref_codes = firebase.database().ref("code");
    let _this = this;
    let storageRef = firebase.storage().ref();

    ref_codes.on("value", function(snapshot) {
      _this.codes.length = 0;
      snapshot.forEach(function(childSnapshot) {
        let value = childSnapshot.val();
        let values = [
          value.code,
          value.name,
          value.date,
          value.precision_float
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

    const firstAudioEvent =
      typeof document.ontouchend !== "undefined" ? "touchend" : "mouseup";
    document.addEventListener(firstAudioEvent, this.initAudioContext);
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
          },
          spectrum: {
            type: "t",
            value: this.spectrum
          },
          samples: {
            type: "t",
            value: this.samples
          },
          volume: {
            type: "f",
            value: this.volume
          },
          midi: {
            type: "t",
            value: this.midi
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
    onWindowResize() {
      let canvas_wrap = document.getElementById("canvas_wrap");

      if (this.expandJudge == 0) {
        this.expandJudge++;
        canvas_wrap.style.zIndex = 999;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.stats.domElement.style.top = "10px";
      } else {
        this.expandJudge--;
        canvas_wrap.style.zIndex = 0;
        this.windowWidth = 512;
        this.windowHeight = 512;
        this.stats.domElement.style.top = "530px";
      }

      this.camera.aspect = this.windowWidth / this.windowHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.windowWidth, this.windowHeight);
      this.code_compile();
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.render();
      this.stats.update();
    },
    render() {
      this.analyser.getByteFrequencyData(this.freqArray);
      this.analyser.getByteTimeDomainData(this.waveArray);
      this.spectrum = null;
      this.spectrum = new THREE.DataTexture(
        this.freqArray,
        64,
        8,
        THREE.LuminanceFormat,
        THREE.UnsignedByteType
      );
      this.spectrum.needsUpdate = true;
      this.samples = null;
      this.samples = new THREE.DataTexture(
        this.waveArray,
        64,
        8,
        THREE.LuminanceFormat,
        THREE.UnsignedByteType
      );
      this.samples.needsUpdate = true;
      this.midi = null;
      this.midi = new THREE.DataTexture(
        this.midiArray,
        256,
        128,
        THREE.LuminanceFormat,
        THREE.FloatType
      );
      this.midi.needsUpdate = true;
      this.volume = this.getAverageVolume(this.freqArray);
      this.time = this.clock.getElapsedTime();
      this.model.material.uniforms.spectrum.value = this.spectrum;
      this.model.material.uniforms.samples.value = this.samples;
      this.model.material.uniforms.volume.value = this.volume;
      this.model.material.uniforms.midi.value = this.midi;

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
      //横長の前提で
      let aspect = this.windowWidth / this.windowHeight;
      this.geometry.dispose();
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

      this.vertex =
        "precision " +
        this.precision_float +
        " float;\n" +
        "uniform float time;\n" +
        "uniform vec2 resolution;\n" +
        "uniform vec2 mouse;\n" +
        "void main(){\n" +
        "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n" +
        "}\n";

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
          },
          spectrum: {
            type: "t",
            value: this.spectrum
          },
          samples: {
            type: "t",
            value: this.samples
          },
          volume: {
            type: "f",
            value: this.volume
          },
          midi: {
            type: "t",
            value: this.midi
          }
        },
        vertexShader: this.vertex,
        fragmentShader: this.fragment
      });
      this.scene.remove(this.model);
      this.model = null;
      this.model = new THREE.Mesh(this.geometry, this.materialShader);
      this.model.position.y = 150;
      this.scene.add(this.model);
      this.shaderError = document.getElementById("shaderError");
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
      let error_marker = document.getElementsByClassName("error_marker");
      if (error_marker.length) {
        alert("エラーを解決してください。");
      } else if (!this.user.uid) {
        alert("ログインしてコードを書いてください");
      } else if (this.fragment.length && this.vertex.length) {
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

        firebase
          .database()
          .ref("code")
          .push({
            code: this.fragment,
            name: codeName,
            date: this.formatDate(new Date(), "YYYY/MM/DD/hh:mm"),
            precision_float: this.precision_float,
            thumbnail: thumbName
          });
      }
    },
    changeCode(index) {
      document.getElementById("codes").classList.remove("active");
      let changeHistory = this.codes[index][0];
      console.log(this.codes[index]);

      this.fragment = changeHistory;
      this.precision_float = this.codes[index][3];
      this.code_compile();
    },
    move_frag() {
      document.getElementById("codes").classList.remove("active");
      document.getElementById("input_area").classList.remove("hidden");
    },
    move_codes() {
      document.getElementById("codes").classList.add("active");
      let code_link = document.getElementsByClassName("code_link");
      let imgsrc = code_link[0].children[0].getAttribute("src");

      let newimage = new Image();
      newimage.src = imgsrc;
      newimage.onerror = function() {
        imgsrc = "https://placegoat.com/200/200";
        code_link[0].children[0].setAttribute("src", imgsrc);
      };
    },
    initAudioContext() {
      // Web Audio　の初期化
      this.context = new AudioContext();
      this.analyser = this.context.createAnalyser();
      let _self = this;
      // マイクの音声を取得。　WebAudioのanalyserにわたしている。
      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then(function(stream) {
          let microphone = _self.context.createMediaStreamSource(stream);
          microphone.connect(_self.analyser);
        })
        .catch(function(error) {
          return;
        });
      this.analyser.minDecibels = -90; //最小値
      this.analyser.maxDecibels = 0; //最大値

      this.analyser.fftSize = 1024; //音域の数
      let bufferLength = this.analyser.frequencyBinCount;
      this.freqArray = new Uint8Array(bufferLength);
      this.waveArray = new Uint8Array(bufferLength);
      //webmidi(only chrome)
      // MIDIデバイス

      if (this.audiofirstjudge == 0) {
        this.init();
        this.animate();
        this.audiofirstjudge = this.audiofirstjudge + 1;
      }
    },
    getAverageVolume(array) {
      //疑似ボリューム生成
      let values = 0;
      let average;

      let length = array.length;

      // get all the frequency amplitudes
      for (var i = 0; i < length; i++) {
        values += array[i];
      }

      average = values / length;
      return average;
    },
    //midi周りの処理
    requestSuccess(data) {
      // Inputデバイスの配列を作成
      let inputIterator = data.inputs.values();
      for (
        let input = inputIterator.next();
        !input.done;
        input = inputIterator.next()
      ) {
        let value = input.value;
        // デバイス情報を保存
        this.midiDevices.inputs[value.name] = value;
        // イベント登録
        value.addEventListener("midimessage", this.inputEvent, false);

      }
    },

    requestError(error) {
      console.error("error!!!", error);
    },
    requestMIDI() {
      if (navigator.requestMIDIAccess) {

        navigator
          .requestMIDIAccess({sysex: true})
          .then(this.requestSuccess, this.requestError);
      } else {
        this.requestError();
      }
    },
    inputEvent(e) {
      let target = e.target;
      let message = "";
      let numArray = [];

      // 2桁の16進数にして表示する
      event.data.forEach(function(val) {
        numArray.push(parseInt("00" + val.toString(16), 16));
      });

      this.midiArray[numArray[0] + numArray[1] * 256] = numArray[2];
      console.log(this.midiArray);
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
  }
};
</script>
<style lang="scss" scoped>
.home {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: black;
  .canvas_wrap {
    position: absolute;
    transition: all 0.3s;
    &:hover {
      a {
        opacity: 1;
      }
    }
    a {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 100;
      transition: all 0.3s;
      opacity: 0;
      img {
        width: 30px;
        height: 30px;
      }
    }
  }
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
  .option_area {
    position: absolute;
    top: 600px;
    background-color: gray;
    width: 512px;
    padding: 10px;
    box-sizing: border-box;
    p {
      margin-bottom: 10px;
    }
    input {
      margin-right: 5px;
    }
    label {
      margin-right: 10px;
    }
  }
}
</style>

