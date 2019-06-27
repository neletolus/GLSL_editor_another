/**
 * @author wongbryan / http://wongbryan.github.io
 *
 * Pixelation shader
 */
import * as THREE from "three";
THREE.PixelShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"pixelSize": { value: 0.03 },

	},

	vertexShader: [

		"varying highp vec2 vUv;",

		"void main() {",

		"vUv = uv;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float pixelSize;",

		"varying highp vec2 vUv;",

		"void main(){",

		"vec2 uv = vUv;",
		"uv = floor( uv / pixelSize) * pixelSize + (pixelSize * 0.5);",
		"gl_FragColor = texture2D(tDiffuse, uv);",

		"}"

	].join( "\n" )
};
