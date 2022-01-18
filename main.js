import './style.css'

import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Import GLTF loader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// AnimeJS
import anime from 'animejs/lib/anime.es.js'

// Import Tweakpane
import { Pane } from 'tweakpane'

const PARAMS = {
  useOrbitCamera: false,
}

/* const pane = new Pane()
pane.addInput(PARAMS, 'useOrbitCamera')
 */

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
let camera = null

const orbitCamera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 1000)
orbitCamera.position.y = 0
orbitCamera.position.z = 20

const staticCamera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 1000)
staticCamera.position.y = 0
staticCamera.position.z = 20

camera = orbitCamera

// Create a Camera Group
const cameraGroup = new THREE.Group()
cameraGroup.add(camera)

scene.add(cameraGroup)

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
  alpha: true,
  preserveDrawingBuffer: false,
  premultipliedAlpha: false
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
//renderer.setClearColor(0x44337a, 0)
renderer.render(scene, camera)
renderer.outputEncoding = THREE.sRGBEncoding

// Turn on shadow for the renderer
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// Load the environment texture
const textureLoader = new THREE.TextureLoader()
const envTexture = textureLoader.load('./textures/garage_1k.jpg')
envTexture.mapping = THREE.EquirectangularReflectionMapping

/*// Grid
 const gridHelper = new THREE.GridHelper(10, 10)
scene.add(gridHelper) */
/* //Axis Helpers
const axisHelper = new THREE.AxesHelper(3)
scene.add(axisHelper) */

// Load the gltf
new GLTFLoader().load('./models/RabbitHead.glb', (gltf) => {

  const rabbitScene = gltf.scene

  const Root = rabbitScene.getObjectByName('Armature')
  const NeckJoint = rabbitScene.getObjectByName('NECK_joint')
  const HeadJoint = rabbitScene.getObjectByName('HEAD_joint')
  const LeftEye = rabbitScene.getObjectByName('L_EYE_mesh')
  const RightEye = rabbitScene.getObjectByName('R_EYE_mesh')
  const LeftUpperEyeLid = rabbitScene.getObjectByName('L_EYE_UP_LID_mesh')
  const RightUpperEyeLid = rabbitScene.getObjectByName('R_EYE_UP_LID_mesh')
  const LeftLowerEyeLid = rabbitScene.getObjectByName('L_EYE_LW_LID_mesh')
  const RightLowerEyeLid = rabbitScene.getObjectByName('R_EYE_LW_LID_mesh')

  rabbitScene.traverse((child) => {

    /* if (child.isBone) {
      console.log(child.name);
    } */

    // Assign Envmap to all materials and activate the shadow casting except for the base
    if (child.isMesh) {
      child.material.envMap = envTexture
      child.material.envMapIntensity = 0.6
      child.material.needsUpdate = true
      if (child.name === 'Base') {
        child.receiveShadow = true
      } else {
        child.castShadow = true
        child.receiveShadow = true
      }
    }

  })

  // Rotate the scene 180 degrees on the Y axis
  rabbitScene.rotation.y = THREE.Math.degToRad(180)

  // Move the scene to the first frame for the Loading Animation
  rabbitScene.position.y = -1
  Root.position.y = -4.2

  // Add the rabbitScene to the scene
  scene.add(rabbitScene)

  /* Loading Animation */
  // Animate the whole scene
  anime({
    targets: rabbitScene.position,
    y: 0,
    duration: 1500,
    delay: 200,
  })
  // Animate the bunny's root
  anime({
    targets: Root.position,
    y: -0.5,
    duration: 2000,
    delay: 1500,
    easing: 'easeOutElastic(1, 0.2)'
  })

  /* Blink Animation */
  // Upper Blink animation
  anime({
    targets: [LeftUpperEyeLid.rotation, RightUpperEyeLid.rotation],
    x: (-Math.PI / 2) + 0.01,
    duration: 100,
    easing: 'linear',
    direction: 'alternate',
    loop: true,
    delay: 2500
  })
  // Lower Blink animation
  anime({
    targets: [LeftLowerEyeLid.rotation, RightLowerEyeLid.rotation],
    x: Math.PI / 8,
    duration: 100,
    easing: 'linear',
    direction: 'alternate',
    loop: true,
    delay: 2500
  })

  // Listen to the mouse move
  addEventListener('mousemove', function (e) {
    var mousecoords = getMousePos(e)
    OrientTowards(mousecoords, LeftEye, 60)
    OrientTowards(mousecoords, RightEye, 60)
    OrientTowards(mousecoords, NeckJoint, 15)
    OrientTowards(mousecoords, HeadJoint, 20)
  })

  // Listen to the touch move
  addEventListener('touchmove', function (e) {    
    var touchcoords = getTouchPos(e)
    OrientTowards(touchcoords, LeftEye, 60)
    OrientTowards(touchcoords, RightEye, 60)
    OrientTowards(touchcoords, NeckJoint, 15)
    OrientTowards(touchcoords, HeadJoint, 20)
  })

})

function getMousePos(e) {
  return { x: e.clientX, y: e.clientY }
} 

function getTouchPos(e) {
  return { x: e.touches[0].clientX, y: e.touches[0].clientY }  
}

function OrientTowards(lookAt, object, degreeLimit) {
  let degrees = getMouseDegrees(lookAt.x, lookAt.y, degreeLimit)
  object.rotation.y = THREE.Math.degToRad(degrees.x)
  object.rotation.x = THREE.Math.degToRad(degrees.y)
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

// Create a Pointlight
const Pointlight = new THREE.PointLight(0xffffff, 1, 100)
Pointlight.position.set(-2, 2, 5)
scene.add(Pointlight)

// Create a DirectionalLight and turn on shadows for the light
const directionallight = new THREE.DirectionalLight(0xffffff, 1, 100)
directionallight.position.set(5, 10, -5)
directionallight.castShadow = true // default false

//Set up shadow properties for the directionallight
directionallight.shadow.mapSize.width = 512 // default
directionallight.shadow.mapSize.height = 512 // default
directionallight.shadow.camera.near = 0.5 // default
directionallight.shadow.camera.far = 500 // default
directionallight.shadow.camera = new THREE.OrthographicCamera(-10, 10, 10, -10, .5, 500)

scene.add(directionallight)

/* LIGHT HELPERS
// Create a helper for Point Light
const pointLightHelper = new THREE.PointLightHelper(Pointlight, 1)
scene.add(pointLightHelper)
//Create a helper for the shadow camera (optional)
const helper = new THREE.CameraHelper( directionallight.shadow.camera )
scene.add( helper )
*/

// Initialize the main loop
const clock = new THREE.Clock()
let lastElapsedTime = 0
let FPS = 0

// FPS DOM
const fpsdom = document.getElementById('FPS')

// Stats
const stats = new Stats()
//stats.showPanel(0)
//document.body.appendChild(stats.dom)
console.log(stats)

// Create the main loop invoking the animate function
const animate = () => {

  stats.begin()

  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - lastElapsedTime
  lastElapsedTime = elapsedTime

  //FPS
  FPS = Math.round(1 / deltaTime)
  //fpsdom.innerHTML = Math.round(FPS)

  // Update camera and controls
  if (PARAMS.useOrbitCamera === true) {
    camera = orbitCamera
    handleResize()
    controls.update()
  } else {
    camera = staticCamera
    handleResize()
  }

  // Render
  renderer.render(scene, camera)

  // Update stats
  stats.end()

  // Call animate again on the next frame
  requestAnimationFrame(animate)
}

animate()

setTimeout(() => {
  fpsdom.innerHTML = "FPS " + Math.round(FPS)
}, 3000)

// Listen to the resize of the window
addEventListener('resize', handleResize())

function handleResize() {
  sizes.width = innerWidth
  sizes.height = innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.render(scene, camera)
}