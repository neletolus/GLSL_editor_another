<template>
  <div class="home">
    <video ref="video" id="video" style="display:none;" autoplay></video>
    <canvas id="canvas"></canvas>
    <div class="element">
      <div class="effect-btn">
        <label for="glitch">
          <input id="glitch" type="checkbox" v-on:change="glitch()">Glitch
        </label>
        <label for="rgb">
          <input id="rgb" type="checkbox" v-on:change="rgb()">RGBshift
        </label>
        <input
          id="rgbrange"
          type="range"
          min="0.001"
          max="0.010"
          step="0.001"
          oninput="this.rgbvalue=this.value"
          value="0.005"
        >

        <label for="mosaic">
          <input id="mosaic" type="checkbox" v-on:change="mosaic()">Mosaic
        </label>
        <input
          id="pixelrange"
          type="range"
          min="0.01"
          max="0.1"
          step="0.01"
          oninput="this.pixelvalue=this.value"
          value="0.03"
        >
        <label for="sepia">
          <input id="sepia" type="checkbox" v-on:change="sepia()">Sepia
        </label>
        <label for="film">
          <input id="film" type="checkbox" v-on:change="film()">Film
        </label>
        <label for="sobel">
          <input id="sobel" type="checkbox" v-on:change="sobel()">Sobel
        </label>
      </div>
      <div id="img-wrap"></div>
    </div>

    <a class="capture_btn" ontouchstart v-on:click="capture()" href="#">
      <div>
        <img src="@/assets/img/shutter.png" alt>
      </div>
    </a>
  </div>
</template>

<script>
import * as THREE from "three";
import EffectComposer from "@/assets/js/postprocessing/EffectComposer.js";
import CopyShader from "@/assets/js/shaders/CopyShader.js";
import ShaderPass from "@/assets/js/postprocessing/ShaderPass.js";
import RenderPass from "@/assets/js/postprocessing/RenderPass.js";
import RGBShiftShader from "@/assets/js/shaders/RGBShiftShader.js";
import DigitalGlitch from "@/assets/js/shaders/DigitalGlitch.js";
import GlitchPass from "@/assets/js/postprocessing/GlitchPass.js";
import SepiaShader from "@/assets/js/shaders/SepiaShader.js";
import FilmShader from "@/assets/js/shaders/FilmShader.js";
import PixelShader from "@/assets/js/shaders/PixelShader.js";
import SobelOperatorShader from "@/assets/js/shaders/SobelOperatorShader.js";

export default {
  name: "home",
  data() {
    const video = {};
    const $canvas = {};
    const camera = null;

    const scene = null;
    const texture = null;
    const geometry = null;

    const material = null;
    const renderer = null;
    const mesh = null;
    const composer = null;
    const digiGlitch = null;
    const rgbShift = null;
    const Pixel = null;
    const Sepia = null;
    const Film = null;
    const AnimationID = null;
    const rgbvalue = 0.005;
    const pixelvalue = 0.03;
    const Sobel = null;
    return {
      video,
      $canvas,
      camera,
      scene,
      texture,
      geometry,
      material,
      renderer,
      mesh,
      composer,
      digiGlitch,
      rgbShift,
      Pixel,
      AnimationID,
      rgbvalue,
      pixelvalue,
      Sepia,
      Film,
      Sobel
    };
  },
  mounted() {
    this.init();
    this.animate();
    const imgWrap = document.getElementById("img-wrap");
    imgWrap.addEventListener("mouseover", function(e) {
      e.target.style.cssText =
        "opacity: 0.5;" +
        "width: 120px;" +
        "height: 120px;" +
        "object-fit: cover";
    });
    imgWrap.addEventListener("mouseout", function(e) {
      e.target.style.cssText =
        "opacity: 1.0;" +
        "width: 120px;" +
        "height: 120px;" +
        "object-fit: cover";
    });
    const rgbrange = document.getElementById("rgbrange");
    const mountrgb = this.rgbShift;
    rgbrange.addEventListener("input", function() {
      console.log(this.rgbvalue);
      mountrgb.uniforms["amount"].value = this.rgbvalue;
    });
    const pixelrange = document.getElementById("pixelrange");
    const mountpixel = this.Pixel;
    pixelrange.addEventListener("input", function() {
      mountpixel.uniforms["pixelSize"].value = this.pixelvalue;
    });
  },
  methods: {
    init() {
      this.camera = new THREE.OrthographicCamera(
        window.innerWidth / -2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / -2,
        1,
        100
      );
      this.camera.position.z = 50;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.scene = new THREE.Scene();
      this.video = document.getElementById("video");
      this.$canvas = document.getElementById("canvas");

      this.texture = new THREE.VideoTexture(this.video);

      this.geometry = new THREE.PlaneBufferGeometry(
        window.innerWidth,
        window.innerHeight
      );
      this.material = new THREE.MeshBasicMaterial({ map: this.texture });

      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.scene.add(this.mesh);
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: this.$canvas,
        preserveDrawingBuffer: true
      });
      this.renderer.setPixelRatio(window.devicePixelRatio);

      //post effect
      this.composer = new THREE.EffectComposer(this.renderer);
      this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
      this.rgbShift = new THREE.ShaderPass(THREE.RGBShiftShader);
      this.Sepia = new THREE.ShaderPass(THREE.SepiaShader);
      this.digiGlitch = new THREE.GlitchPass();
      this.Film = new THREE.ShaderPass(THREE.FilmShader);
      this.Pixel = new THREE.ShaderPass(THREE.PixelShader);
      this.Sobel = new THREE.ShaderPass(THREE.SobelOperatorShader);
      this.digiGlitch.goWild = true;
      this.composer.addPass(this.rgbShift);
      this.rgbShift.enabled = false;
      this.rgbShift.renderToScreen = true;
      this.composer.addPass(this.Sepia);
      this.Sepia.enabled = false;
      this.composer.addPass(this.Film);
      this.Film.enabled = false;
      this.composer.addPass(this.Pixel);
      this.Pixel.enabled = false;
      this.composer.addPass(this.digiGlitch);
      this.digiGlitch.enabled = false;
      this.composer.addPass(this.Sobel);
      this.Sobel.enabled = false;

      // 初期化のために実行
      this.onResize();
      // this.video.play(); //デバッグ用
      // リサイズイベント発生時に実行
      window.addEventListener("resize", this.onResize);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          this.video.srcObject = stream;
          this.video.play();
        });
      }
    },
    onResize() {
      // サイズを取得
      const width = window.innerWidth;
      const height = window.innerHeight;

      // レンダラーのサイズを調整する
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(width, height);

      // カメラのアスペクト比を正す
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    },

    animate() {
      const time = Date.now() * 0.005;
      // this.mesh.rotation.x = time * 0.1;
      // this.mesh.rotation.y = time * 0.1;
      this.AnimationID = requestAnimationFrame(this.animate);
      this.composer.render(this.scene, this.camera);
    },
    glitch() {
      if (this.digiGlitch.enabled == true) {
        this.digiGlitch.enabled = false;
      } else {
        this.digiGlitch.enabled = true;
      }
    },
    rgb() {
      if (this.rgbShift.enabled == true) {
        this.rgbShift.enabled = false;
      } else {
        this.rgbShift.enabled = true;
      }
    },
    mosaic() {
      if (this.Pixel.enabled == true) {
        this.Pixel.enabled = false;
      } else {
        this.Pixel.enabled = true;
      }
    },
    sepia() {
      if (this.Sepia.enabled == true) {
        this.Sepia.enabled = false;
      } else {
        this.Sepia.enabled = true;
      }
    },
    film() {
      if (this.Film.enabled == true) {
        this.Film.enabled = false;
      } else {
        this.Film.enabled = true;
      }
    },
    sobel() {
      if (this.Sobel.enabled == true) {
        this.Sobel.enabled = false;
      } else {
        this.Sobel.enabled = true;
      }
    },
    capture() {
      cancelAnimationFrame(this.AnimationID);
      var imgroot = document.getElementById("img-wrap");
      if (imgroot.hasChildNodes()) {
        imgroot.removeChild(imgroot.firstChild);
      }

      var url = this.$canvas.toDataURL("image/jpeg", 0.5);
      var link = document.createElement("a");
      var img = document.createElement("img");
      link.href = url;
      link.setAttribute("target", "_blank");
      img.src = url;
      img.style.cssText =
        "width: 120px;" + "height: 120px;" + "object-fit: cover";
      link.appendChild(img);
      document.getElementById("img-wrap").appendChild(link);
      this.animate();
    }
  }
};
</script>
<style lang="scss" scoped>
.home {
  width: 100%;
  height: auto;
  position: relative;
  #canvas {
    z-index: 0;
    position: fixed;
  }
  .element {
    position: fixed;
    z-index: 100;
    right: 0;
    width: 130px;
    .effect-btn {
      padding: 15px;
      margin-bottom: 30px;
      background-color: rgba(255, 255, 255, 0.5);
      width: 100%;
      height: auto;
      label {
        display: block;
        margin: 10px 0;
      }
      input[type="range"] {
        width: 100px;
        height: auto;
      }
    }
    #img-wrap {
      width: 100%;
      height: auto;
    }
    @media screen and (max-width: 768px) {
    }
  }

  .capture_btn {
    position: fixed;
    z-index: 100;
    bottom: 50px;
    left: calc(50% - 50px);
    display: block;
    opacity: 1;
    transition: all 0.3s;
    div {
      position: relative;
      width: 100px;
      height: 100px;
      background-color: white;
      border-radius: 100%;
      text-align: center;
      img {
        margin-top: 10%;
        width: 80%;
        height: 80%;
        transition: all 0.5s;
      }
    }
    @media screen and (min-width: 768px) {
      &:hover {
        opacity: 0.5;
        div {
          img {
            margin-top: 25%;
            width: 50%;
            height: 50%;
            transform: rotate(-45deg);
          }
        }
      }
    }

    &:active {
      opacity: 0.5;
      div {
        img {
          margin-top: 25%;
          width: 50%;
          height: 50%;
          transform: rotate(-45deg);
        }
      }
    }
  }
}
</style>

