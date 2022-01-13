import './style.css'

import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Import GLTF loader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Window. Sizes
const sizes = {
  height: window.innerHeight,
  width: window.innerWidth
}

// Create a scene
const scene = new THREE.Scene()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Create a camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(5, 5, 15)
scene.add(camera)

// Orbit controls
const controls = new OrbitControls(camera, canvas)
controls.dampingFactor = 0.25
controls.enableDamping = true
controls.enableZoom = true
controls.enablePan = true
controls.enableRotate = true
controls.autoRotate = true
controls.autoRotateSpeed = .01

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: false,
  preserveDrawingBuffer: false,
  premultipliedAlpha: false
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setClearColor(0x101010, 0)
renderer.render(scene, camera)
renderer.outputEncoding = THREE.sRGBEncoding

// Load the environment texture
const textureLoader = new THREE.TextureLoader()
const envTexture = textureLoader.load('./assets/garage_1k.jpg')
envTexture.mapping = THREE.EquirectangularReflectionMapping

// Grid
const gridHelper = new THREE.GridHelper(10, 10)
scene.add(gridHelper)

//Axis Helpers
const axisHelper = new THREE.AxesHelper(3)
scene.add(axisHelper)

// Eyes
let LeftEye = null
let RightEye = null
let Head = null

// Create Gltf loader
const rabbitHead = new GLTFLoader()

rabbitHead.load('./assets/models/RabbitHead.glb', (gltf) => {
  const rabbit = gltf.scene

  rabbit.traverse((child) => {
    if (child.isMesh) {
      child.material.envMap = envTexture
      child.material.envMapIntensity = 1
      child.material.needsUpdate = true
      child.castShadow = true
      child.receiveShadow = true
    }

    if (child.name === 'L_EYE_mesh') {
      LeftEye = child  
    }
    if (child.name === 'R_EYE_mesh') {
      RightEye = child      
    }

  })
  
  scene.add(rabbit)

})

// Create a light
const light = new THREE.PointLight(0xffffff, 1, 100)
light.position.set(10, 10, 10)
scene.add(light)


// Initialize the main loop
const clock = new THREE.Clock()
let lastElapsedTime = 0
let FPS = 0

// Stats
const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

// Create the main loop invoking the animate function
const animate = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - lastElapsedTime
  lastElapsedTime = elapsedTime

  //FPS
  FPS = Math.round(1 / deltaTime)

  // Update controls
  controls.update()

  // Update stats
  stats.update()

  // Render
  renderer.render(scene, camera)

  // Call animate again on the next frame
  requestAnimationFrame(animate)
}

animate()

// Manage the resize of the window
addEventListener('resize', () => {

  sizes.width = innerWidth
  sizes.height = innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.render(scene, camera)

})

addEventListener('mousemove', function (e) {
  var mousecoords = getMousePos(e)  
  moveEye(mousecoords, LeftEye, 60)
  moveEye(mousecoords, RightEye, 60)
});

function getMousePos(e) {
  return { x: e.clientX, y: e.clientY }
}

function moveEye(mouse, eye, degreeLimit) {
  let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit)
  eye.rotation.y = THREE.Math.degToRad(degrees.x)
  eye.rotation.x = THREE.Math.degToRad(degrees.y)
}


/* https://tympanus.net/codrops/2019/10/14/how-to-create-an-interactive-3d-character-with-three-js/

getMouseDegrees does this: It checks the top half of the screen,
the bottom half of the screen, the left half of the screen,
and the right half of the screen. It determines where the mouse
is on the screen in a percentage between the middle and each edge of the screen.
For instance, if the mouse is half way between the middle of the
screen and the right edge. The function determines that right = 50%,
if the mouse is a quarter of the way UP from the center, the function determines that up = 25%.
Once the function has these percentages, it returns the percentage of the degreelimit.
So the function can determine your mouse is 75% right and 50% up,
and return 75% of the degree limit on the x axis and 50% of the degree limit on the y axis.
Same for left and right. */

function getMouseDegrees(x, y, degreeLimit) {
  let dx = 0,
    dy = 0,
    xdiff,
    xPercentage,
    ydiff,
    yPercentage;

  let w = { x: window.innerWidth, y: window.innerHeight };

  // Left (Rotates neck left between 0 and -degreeLimit)

  // 1. If cursor is in the left half of screen
  if (x <= w.x / 2) {
    // 2. Get the difference between middle of screen and cursor position
    xdiff = w.x / 2 - x;
    // 3. Find the percentage of that difference (percentage toward edge of screen)
    xPercentage = (xdiff / (w.x / 2)) * 100;
    // 4. Convert that to a percentage of the maximum rotation we allow for the neck
    dx = ((degreeLimit * xPercentage) / 100) * -1;
  }
  // Right (Rotates neck right between 0 and degreeLimit)
  if (x >= w.x / 2) {
    xdiff = x - w.x / 2;
    xPercentage = (xdiff / (w.x / 2)) * 100;
    dx = (degreeLimit * xPercentage) / 100;
  }
  // Up (Rotates neck up between 0 and -degreeLimit)
  if (y <= w.y / 2) {
    ydiff = w.y / 2 - y;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    // Note that I cut degreeLimit in half when she looks up (NOT ANYMORE)
    dy = (((degreeLimit * 1) * yPercentage) / 100);
  }

  // Down (Rotates neck down between 0 and degreeLimit)
  if (y >= w.y / 2) {
    ydiff = y - w.y / 2;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    dy = (degreeLimit * yPercentage) / 100 * -1;
  }
  return { x: dx, y: dy };
}