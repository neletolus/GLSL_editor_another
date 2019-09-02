<template>
  <div class="home">
    <canvas id="canvas"></canvas>
    <p id="vertexShader">
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;
      void main(){
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    </p>
    <div class="text_contents">
      <textarea v-model="fragment" name="fragment" id="fragmentText" cols="30" rows="10"></textarea>
      <button v-on:click="frag_compile">compile</button>
    </div>
  </div>
</template>
<script>
import * as THREE from "three";
export default {
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
      fragment:
        "precision mediump float;\n\n" +
        "void main(){\n" +
        "gl_FragColor = vec4(vec3(1.0,0.0,0.0),1.0); }"
    };
  },
  mounted() {
    window.addEventListener("load", function() {
      document.getElementById("fragmentText").textContent = this.fragment;
    });
    this.init();
    this.animate();
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
      this.renderer.render(this.scene, this.camera);
    },
    frag_compile() {
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
          }
        },
        vertexShader: document.getElementById("vertexShader").textContent,
        fragmentShader: this.fragment
      });

      this.model = new THREE.Mesh(this.geometry, this.materialShader);
      this.model.position.y = 150;
      this.scene.add(this.model);
    }
  }
};
</script>
<style lang="scss" scoped>
.home {
  position: relative;
  width: 100%;
  height: auto;
  .text_contents {
    z-index: 90;
    position: absolute;
    top: 0;
    #fragmentText {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
}
</style>

