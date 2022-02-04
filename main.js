/*-----------------------------------*/
/*------------IMPORT-----------------*/
/*-----------------------------------*/

import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Import GLTF and DRACO loader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'


// AnimeJS
import anime from 'animejs/lib/anime.es.js'

// Import Tweakpane
import { Pane } from 'tweakpane'
const PARAMS = {
  useOrbitCamera: false
}
//const pane = new Pane()
//pane.addInput(PARAMS, 'useOrbitCamera')

// Import Stats
import Stats from 'three/examples/jsm/libs/stats.module.js'

// Stats
/* const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom) */



/*******************/
/* DOM REFERENCING */
/*******************/

const inputEmail = document.getElementById('Email')
const inputPassword = document.getElementById('Password')
const LoginButton = document.getElementById('LoginButton')






/******************/
/* THREE.JS SETUP */
/******************/

// Create a scene
const scene = new THREE.Scene()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Window. Sizes
const sizes = {
  height: window.innerHeight,
  width: window.innerWidth
}

// Create a camera
let camera = null

const orbitCamera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 1000)
orbitCamera.position.y = 2
orbitCamera.position.z = 16
orbitCamera.lookAt({ x: 0, y: 2, z: 0 })

const staticCamera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 1000)
//staticCamera.position.y = -1.5
staticCamera.position.z = 15
staticCamera.lookAt(0, -1.5, 0)

camera = orbitCamera
scene.add(camera)

// Orbit controls
const controls = new OrbitControls(camera, canvas)

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
  //preserveDrawingBuffer: false,
  //premultipliedAlpha: false
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setClearColor(0x44337a, 0)
renderer.render(scene, camera)
renderer.outputEncoding = THREE.sRGBEncoding


/* GRID
const gridHelper = new THREE.GridHelper(10, 10)
scene.add(gridHelper)
// AXIS HELPER
const axisHelper = new THREE.AxesHelper(3)
scene.add(axisHelper)
*/

/*****************/
/* TEXTURE SETUP */
/*****************/

// Load the environment texture
const textureLoader = new THREE.TextureLoader()
const envTexture = textureLoader.load('./textures/envMap.jpg')
envTexture.mapping = THREE.EquirectangularReflectionMapping

// Load the baked texture
const bakedTextureLoader = new THREE.TextureLoader()
const bakedTexture = bakedTextureLoader.load('./textures/baked.jpg')
bakedTexture.encoding = THREE.sRGBEncoding ////////////////////////////// SUPER IMPORTANT !!!
bakedTexture.flipY = false


/******************/
/* MATERIAL SETUP */
/******************/

// Create a new basic material for the baked Material
const bakedMaterial = new THREE.MeshBasicMaterial({
  map: bakedTexture,
})

// Create a new Standard Material for the eyes to enable reflections
const eyesMaterial = new THREE.MeshStandardMaterial({
  map: bakedTexture,
  envMap: envTexture,
  roughness: 0,
  envMapIntensity: 3.0,
})

/*********************/
/* GLTF MODEL LOADER */
/*********************/

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./decoder/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// Load the gltf
gltfLoader.load('./models/RabbitHead.glb', (gltf) => {

  const rabbitScene = gltf.scene

  //console.log(rabbitScene)

  const Root = rabbitScene.getObjectByName('Armature')
  const NeckJoint = rabbitScene.getObjectByName('NECK_joint')
  const HeadJoint = rabbitScene.getObjectByName('HEAD_joint')
  const ChinJoint = rabbitScene.getObjectByName('CHIN_joint')
  const LeftEye = rabbitScene.getObjectByName('L_EYE_mesh')
  const RightEye = rabbitScene.getObjectByName('R_EYE_mesh')
  const LeftUpperEyeLid = rabbitScene.getObjectByName('L_EYE_UP_LID_mesh')
  const RightUpperEyeLid = rabbitScene.getObjectByName('R_EYE_UP_LID_mesh')
  const LeftLowerEyeLid = rabbitScene.getObjectByName('L_EYE_LW_LID_mesh')
  const RightLowerEyeLid = rabbitScene.getObjectByName('R_EYE_LW_LID_mesh')

  const RightHand = rabbitScene.getObjectByName('R_HAND_mesh')
  const LeftHand = rabbitScene.getObjectByName('L_HAND_mesh')

  rabbitScene.traverse((child) => {

    if (child.name.includes('EYE_mesh')) {
      child.material = eyesMaterial
    } else {
      child.material = bakedMaterial
    }

  })

  // Rotate the scene 180 degrees on the Y axis to facing the camera
  rabbitScene.rotation.y = THREE.Math.degToRad(180)

  // Move the scene to the first frame for the Loading Animation
  //rabbitScene.position.y = -0.5

  // Move the bunny root down on the Y axis for the Loading Animation
  Root.position.set(0, -4.5, 1)

  // Move the bunny's hands down on the Y axis for the Loading Animation
  RightHand.position.set(0, -2.5, 2)
  LeftHand.position.set(0, -2.5, 2)

  // Add the rabbitScene to the scene
  scene.add(rabbitScene)








  /***************************/
  /* Loading Intro Animation */
  /***************************/

  // Animate the hands position
  anime({
    targets: [LeftHand.position, RightHand.position],
    y: 0,
    z: 0,
    duration: 500,
    delay: anime.stagger(1000),
    easing: 'easeOutBack',
  })

  // Animate the bunny's root
  // easing: 'spring(mass, stiffness, damping, velocity)' spring(1, 80, 10, 0)
  anime({
    targets: Root.position,
    y: -0.5,
    z: 0,
    delay: 1700,
    duration: 500,
    easing: 'spring(.5, 90, 10, 0)'
  })









  /*******************/
  /* Blink Animation */
  /*******************/

  let canBlink = true

  function Blink() {
    if (canBlink == true) {

      // Upper Blink animation
      anime({
        targets: [LeftUpperEyeLid.rotation, RightUpperEyeLid.rotation],
        x: (-Math.PI / 2) + 0.01,
        duration: 80,
        easing: 'linear',
        direction: 'alternate',
      })

      // Lower Blink animation
      anime({
        targets: [LeftLowerEyeLid.rotation, RightLowerEyeLid.rotation],
        x: Math.PI / 8,
        duration: 80,
        easing: 'linear',
        direction: 'alternate',

      })
    }
  }

  // Start the blink animation and repeat it every 2.5 seconds
  setInterval(Blink, 2500)





  /**********************************/
  /* Follow Mouse Cursor Animation  */
  /**********************************/

  let eyesCanFollowMouse = true
  let headCanFollowMouse = true

  // Listen to the mouse move
  addEventListener('mousemove', followMouseCursor)
  // Listen to the mouse click on the canvas
  canvas.addEventListener('click', followMouseCursor)


  function followMouseCursor(e) {
    var mousecoords = getMousePos(e)

    canBlink = true

    if (eyesCanFollowMouse == true) {
      OrientTowards(LeftEye, mousecoords, 60)
      OrientTowards(RightEye, mousecoords, 60)
    }

    if (headCanFollowMouse == true) {
      OrientTowards(NeckJoint, mousecoords, 15)
      OrientTowards(HeadJoint, mousecoords, 10)      
    }


  }

  // Listen to the touch move
  addEventListener('touchmove', function (e) {
    var touchcoords = getTouchPos(e)

    canBlink = true

    if (eyesCanFollowMouse == true) {
      OrientTowards(LeftEye, touchcoords, 60)
      OrientTowards(RightEye, touchcoords, 60)
    }

    if (headCanFollowMouse == true) {
      OrientTowards(NeckJoint, touchcoords, 15)
      OrientTowards(HeadJoint, touchcoords, 10)      
    }

  })




  
  /****************************************************************************************************/
  /***************************************************************************** INPUT FORM ANIMATION */
  /****************************************************************************************************/
  
  // When the user interact with email input
  //inputEmail.addEventListener('click', focusOnMail)
  inputEmail.addEventListener('focus', focusOnMail)
  inputEmail.addEventListener('input', focusOnMail)  
  inputEmail.addEventListener('focusout', focusOutMail)

    // When the user interact with email input
  //inputPassword.addEventListener('click', focusOnPassword)
  inputPassword.addEventListener('focus', focusOnPassword)
  inputPassword.addEventListener('input', focusOnPassword)
  inputPassword.addEventListener('focusout', focusOutPassword)
  
  ////////////////////////////////////////////////////////////////////////////////////////////// ON MAIL
  function focusOnMail() {
    eyesCanFollowMouse = false
    canBlink = false

    // Get the length of the email input
    let inputMailLength = inputEmail.value.length

    // Move the Root to the look at the email input
    anime({
      targets: Root.position,
      y: -0.2,
      z: -1,
      duration: 500,
      easing: 'easeOutElastic(1, .8)',
      delay: 250,
    })
    anime({
      targets: Root.rotation,
      x: + THREE.Math.degToRad(-20),
      duration: 500,
      easing: 'easeOutElastic(1, .8)',
      delay: 250,
    })

    // Animate the hands resetting to the original rotation on the Y axis
    anime({
      targets: [RightHand.rotation, LeftHand.rotation],
      y: 0,
      duration: 250,
      easing: 'easeOutElastic(1, .8)',
      delay: 100,
    })


    // Move eyes to the beginning of the email input
    // and add inputMail Length as an offset    
    anime({
      targets: [LeftEye.rotation, RightEye.rotation],
      x: (-Math.PI / 2) + 0.5,
      y: (-Math.PI / 2) + inputMailLength * 0.045 + 1,
      duration: 500,
      easing: 'easeOutElastic(1, .8)'
    })

    // Rotate the EyeLids on the X axis
    anime({
      targets: [LeftUpperEyeLid.rotation, RightUpperEyeLid.rotation],
      x: (-Math.PI / 2) + 0.5,
      duration: 500,
      easing: 'easeOutElastic(1, .8)'
    })

  } // END ON MAIL

/////////////////////////////////////////////////////////////////////////////////////////////// OUT MAIL
  function focusOutMail() {
    eyesCanFollowMouse = true
    canBlink = true

    // Move the Root to reset the position
    anime({
      targets: Root.position,
      y: -0.5,
      z: 0,
      duration: 500,
      easing: 'easeOutElastic(1, .8)'
    })
    anime({
      targets: Root.rotation,
      x: + THREE.Math.degToRad(0),
      duration: 500,
      easing: 'easeOutElastic(1, .8)',
      delay: 250,
    })

    // Rotates the EyeLids back to the original position
    anime({
      targets: [LeftUpperEyeLid.rotation, RightUpperEyeLid.rotation],
      x: 0,
      duration: 500,
      easing: 'easeOutElastic(1, .8)'
    })

    // Animate the Right hand rotating them  on the Y axis
    anime({
      targets: [RightHand.rotation],
      y: THREE.Math.degToRad(10),
      easing: 'easeOutElastic(1, .8)',
      duration: 100,
      delay: 0,
    })
    // Same for the Left hand
    anime({
      targets: [LeftHand.rotation],
      y: THREE.Math.degToRad(-10),
      easing: 'easeOutElastic(1, .8)',
      duration: 100,
      delay: 0,
    })


  } // END OUT MAIL

  /******************************************************************************************************/
  /********************************************************************** PASSWORD INPUT FORM ANIMATION */
  /******************************************************************************************************/

  //////////////////////////////////////////////////////////////////////////////////////////// ON PASSWORD
  function focusOnPassword() {
    eyesCanFollowMouse = false
    headCanFollowMouse = false

    // Get the length of the password input
    let inputPasswordLength = inputPassword.value.length

    if (inputPasswordLength > 5) {

      // Move eyes to the beginning of the password input
      // and add inputPasswordLength as an offset      
      anime({
        targets: [LeftEye.rotation, RightEye.rotation],
        x: THREE.Math.degToRad(-10),
        y: (-Math.PI / 2) + inputPasswordLength * 0.045 + 1,
        duration: 250,
        direction: 'alternate',
        loop: 1,
        easing: 'easeOutElastic(1, .8)',
      })

      // Rotate the EyeLids on the X axis
      anime({
        targets: [LeftUpperEyeLid.rotation, RightUpperEyeLid.rotation],
        x: THREE.Math.degToRad(-50),
        duration: 250,
        direction: 'alternate',
        loop: 1,
        easing: 'easeOutElastic(1, .8)',
      })

    } else {

      // Rotate the Eye on the X and Y axis to reset the eyes position
      anime({
        targets: [LeftEye.rotation, RightEye.rotation],
        x: 0,
        y: 0,
        duration: 500,
        easing: 'easeOutElastic(1, .8)'
      })

      // Rotate the EyeLids on the X axis
      anime({
        targets: [LeftUpperEyeLid.rotation, RightUpperEyeLid.rotation],
        x: 0,
        duration: 500,
        easing: 'easeOutElastic(1, .8)'
      })


    }

    // Move eyes to the beginning of the password input
    // and add inputPasswordLength as an offset

    // Move the NeckJoint down on the Y axis to hide it in the hole
    anime({
      targets: NeckJoint.position,
      y: -1.3,
      duration: 500,
      easing: 'easeOutElastic(1, .8)'
    })

    // Rotate the HeadJoint on the X axis to reset the Head position
    anime({
      targets: HeadJoint.rotation,
      x: 0.3,
      y: 0,
      duration: 100,
      easing: 'easeOutElastic(1, .8)'
    })

    // Animate the Right hand rotating them  on the Y axis
    anime({
      targets: [RightHand.rotation],
      y: THREE.Math.degToRad(15),
      easing: 'easeOutElastic(1, .8)',
      duration: 400,
      delay: 0,
    })
    // Same for the Left hand
    anime({
      targets: [LeftHand.rotation],
      y: THREE.Math.degToRad(-15),
      easing: 'easeOutElastic(1, .8)',
      duration: 400,
      delay: 0,
    })


  } // END ON PASSWORD

  /////////////////////////////////////////////////////////////////////////////////////////// OUT PASSWORD
  function focusOutPassword() {
    eyesCanFollowMouse = true
    headCanFollowMouse = true

    // Move the NeckJoint up on the Y axis
    anime({
      targets: NeckJoint.position,
      y: -0.626,
      duration: 500,
      easing: 'easeOutElastic(1, .8)'
    })    

    // Rotate the EyeLids on the X axis
    anime({
      targets: [LeftLowerEyeLid.rotation, RightLowerEyeLid.rotation],
      x: 0,
      duration: 500,
      easing: 'easeOutElastic(1, .8)'
    })

    // Animate the Right hand rotating them  on the Y axis
    anime({
      targets: [RightHand.rotation],
      y: THREE.Math.degToRad(10),
      easing: 'easeOutElastic(1, .8)',
      duration: 90,
      delay: 0,
    })
    // Same for the Left hand
    anime({
      targets: [LeftHand.rotation],
      y: THREE.Math.degToRad(-10),
      easing: 'easeOutElastic(1, .8)',
      duration: 90,
      delay: 0,
    })
  } // END OUT PASSWORD




},
  // called as loading progresses
  function (xhr) { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
  // called when loading has errors
  function (error) { error })





/********************/
/****** LIGHTS ******/
/********************/

// Create a Pointlight
const Pointlight = new THREE.PointLight(0xffffff, 0.5, 100)
Pointlight.position.set(-2, 2, 5)
// Add shadow
//Pointlight.castShadow = true
//scene.add(Pointlight)

// LIGHT HELPERS
// Create a helper for Point Light
const pointLightHelper = new THREE.PointLightHelper(Pointlight, 1)
//scene.add(pointLightHelper)

// Initialize the main loop
const clock = new THREE.Clock()
let lastElapsedTime = 0
let FPS = 0

// Create a point object with a new key position and a new key alement
const point =
{
  position: new THREE.Vector3(0, -0.8, 3.14),
  element: document.querySelector('.point')
}

/* // Create a sphere representing the point
const sphere = new THREE.SphereGeometry(0.1, 32, 32)
const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
const spheremesh = new THREE.Mesh(sphere, material)
// Set the position of the sphere to the position of the point
spheremesh.position.copy(point.position)
scene.add(spheremesh) */







/******************************/
/****** ANIMATE FUNCTION ******/
/******************************/

// Create the main loop invoking the animate function
const animate = () => {

  //stats.begin()

  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - lastElapsedTime
  lastElapsedTime = elapsedTime

  //FPS
  FPS = Math.round(1 / deltaTime)

  // Update camera and controls
  if (PARAMS.useOrbitCamera === true) {
    camera = orbitCamera
    handleResize()
    controls.update()
  } else {
    camera = staticCamera
    handleResize()
  }

  // Update the point position    
  const screenPosition = point.position.clone()
  screenPosition.project(camera)

  const translateX = sizes.width / 2 //screenPosition.x * sizes.width * 0.5
  const translateY = - screenPosition.y * sizes.height * 0.5
  point.element.style.transform = `translateY(${translateY}px)`

  // Render the scene
  renderer.render(scene, camera)

  // Update stats
  //stats.end()

  // Call animate again on the next frame
  requestAnimationFrame(animate)
}

animate()



/*-----------------------------------------*/
/*----------- RESIZE EVENT ----------------*/
/*-----------------------------------------*/


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

/*---------------------------------------------*/
/*------------UTLITY FUNCTIONS-----------------*/
/*---------------------------------------------*/

function getMousePos(e) {
  return { x: e.clientX, y: e.clientY }
}

function getTouchPos(e) {
  return { x: e.touches[0].clientX, y: e.touches[0].clientY }
}

function OrientTowards(object, lookAt, degreeLimit) {
  let degrees = getMouseDegrees(lookAt.x, lookAt.y, degreeLimit)
  object.rotation.y = THREE.Math.degToRad(degrees.x)
  object.rotation.x = THREE.Math.degToRad(degrees.y)

  return [object.rotation.y, object.rotation.x]
}

function getMouseDegrees(x, y, degreeLimit) {
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