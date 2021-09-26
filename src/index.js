import * as THREE from 'three'

import {GLTFLoader} from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js'

/* CONSTANTS */
var increment = 1;
var canvas = document.querySelector('.webgl')
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100 );
const planeSize = 60;
const sizes = {
    width : window.innerWidth-350,
    height : window.innerHeight-30
}
const renderer= new THREE.WebGLRenderer({
  canvas : canvas
})
const orbitControls = new OrbitControls(camera, renderer.domElement);
var mouse = { x : 0, y : 0 };
var raycaster = new THREE.Raycaster();
var selectedVP;
var viewPoints = {};

/* METHODS CALLS */
AddEventListeners()
SetPlaneTexture()
SetBackgroundSky()
LoadRoverModel()
AddLights()
AddCamera()
SetUpRenderer()
animationrequest()

/* METHOD DEFINITIONS */
function animationrequest()
{
    requestAnimationFrame(animationrequest)
    camera.lookAt( scene.position );
    renderer.render(scene,camera)
}

function raycast ( e ) {
    //1. sets the mouse position with a coordinate system where the center of the screen is the origin
    var rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ( ( e.clientX - rect.left ) / rect.width ) * 2 - 1;
    mouse.y = - ( ( e.clientY - rect.top ) / rect.height ) * 2 + 1;
  
    //2. set the picking ray from the camera position and mouse coordinates
    raycaster.setFromCamera( mouse, camera );  
  
    //3. compute intersections
    var intersects = raycaster.intersectObjects( scene.children , true);

    if (intersects.length > 0)
    {
        for ( var i = 0; i < intersects.length; i++ )
        {
            if(intersects[i].object.name.startsWith("MyCube"))
            {
                selectedVP = intersects[i];
                camera.position.set(intersects[i].object.userdata.pos1,intersects[i].object.userdata.pos2,intersects[i].object.userdata.pos3)
                camera.lookAt(0,1,0)
            }
                
        }
    
    }
}

export function setViewPoint(){
    var cameraX = document.getElementById("x").value
    var cameraY = document.getElementById("y").value
    var cameraZ = document.getElementById("z").value
  
    //var geometry = new THREE.SphereGeometry(0.1);

    var geometry = new THREE.BoxGeometry(0.2,0.2,0.2);
    var color = generateRandomColor();
    var material = new THREE.MeshPhongMaterial({color: new THREE.Color(color)});
    var cube = new THREE.Mesh(geometry,material);
    cube.name = "MyCube_"+increment
    cube.position.z = cameraZ;
    cube.position.x = cameraX;
    cube.position.y = cameraY;
    cube.userdata = {pos1: cameraX , pos2: cameraY , pos3: cameraZ }
    scene.add(cube);

    //var obj = scene.getObjectByName( "MyCube_"+increment, true )
    //add to map
    viewPoints["MyCube_"+increment] = cameraX + "," + cameraY + "," + cameraZ; 
    
    GenerateViewPointTable(color, increment)

    //document.getElementById("traverse").disabled = false

    increment = increment + 1
}

function GenerateViewPointTable(color, increment){
    var displayTable = document.getElementById("viewPointDetails")
    var row = document.createElement("tr");
    row.setAttribute("id", "row_"+increment)
    
    
    var cell1 = document.createElement("td");
    var cell1Text = document.createElement('div');
    cell1Text.appendChild(document.createTextNode("Viewpoint" + increment))
    cell1.appendChild(cell1Text)

    var cell2 = document.createElement("td");
    var cellColorBox = document.createElement('div');
    cellColorBox.setAttribute("class", "color-box");
    //console.log(color)
    cellColorBox.setAttribute("style", "background-color:"+color);
    cell2.appendChild(cellColorBox)

    var cell3 = document.createElement("td");
    var cell3Content = document.createElement('div');
    var previewButton = document.createElement("input");
    previewButton.setAttribute("type", "image")
    previewButton.setAttribute("src", "Elements/eye.png")
    previewButton.addEventListener("click", function(){
        //camera.position.set
        for( var i = scene.children.length - 1; i >= 0; i--) { 
            var obj = scene.children[i];
            if(obj.name.toString()== "MyCube_"+increment){
                console.log(obj.userdata)
                camera.position.set(obj.userdata.pos1,obj.userdata.pos2,obj.userdata.pos3)
            }
        }
    })
    cell3Content.appendChild(previewButton)
    cell3.appendChild(cell3Content)

    var cell4 = document.createElement("td");
    var cell4Content = document.createElement('div');
    var removeButton = document.createElement("input");
    removeButton.setAttribute("type", "image")
    removeButton.setAttribute("src", "Elements/cancel.png")
    removeButton.addEventListener("click" , function () {

        //remove from scene
        for( var i = scene.children.length - 1; i >= 0; i--) { 
            var obj = scene.children[i];
            if(obj.name.toString()== "MyCube_"+increment){
                if(selectedVP !=null && selectedVP.object.name == obj.name)
                {
                    if (confirm('Are you sure you want to delete the current viewpoint')) {
                        scene.remove(obj); 
                        document.getElementById("row_"+increment).remove()
                        setCameraToDefault();
                        selectedVP = null;
                      } else {
                        
                      }
                }
                else{
                    scene.remove(obj); 
                    document.getElementById("row_"+increment).remove()
                }
                
            }
                
       }
    })
    cell4Content.appendChild(removeButton)
    cell4.appendChild(cell4Content)
    
    row.appendChild(cell1)
    row.appendChild(cell2)
    row.appendChild(cell3)
    row.appendChild(cell4)
    displayTable.appendChild(row)
}

export function resetViewPoint()
{
    setCameraToDefault()
    for( var i = scene.children.length - 1; i >= 0; i--) { 
        var obj = scene.children[i];
        if(obj.name.startsWith("MyCube_"))
            scene.remove(obj); 
   }
   document.getElementById("x").value = 0;
   document.getElementById("y").value = 0;
   document.getElementById("z").value = 0;

   // clean viewpoint table
   document.getElementById("viewPointDetails").innerHTML = ""
}

export function zoomOutToDefaultPosition()
{
    setCameraToDefault()
}

function AddCamera(){
    setCameraToDefault()
    scene.add(camera)
}

function setCameraToDefault(){
    camera.position.set(2,0.8,1.75)
}

function SetPlaneTexture(){
    const planeloader = new THREE.TextureLoader();
    const texture = planeloader.load('Elements/2.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 10;
    texture.repeat.set(repeats, repeats);
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const planemesh = new THREE.Mesh(planeGeo, planeMat);
    planemesh.rotation.x = Math.PI * -.5;
    scene.add(planemesh);
}

function SetBackgroundSky(){
    const backGroundloader = new THREE.TextureLoader();
    //backGroundloader.load('https://images.pexels.com/photos/1205301/pexels-photo-1205301.jpeg' , function(texture)
    backGroundloader.load('Elements/background.jpg' , function(texture)
    {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 20;
        texture.repeat.set(repeats, repeats);
        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        });
        const planemesh = new THREE.Mesh(planeGeo, planeMat);
        planemesh.rotation.x = Math.PI * -.5;
        scene.background = texture;  
    });
}

function LoadRoverModel(){
    const loader = new GLTFLoader()
    loader.load('Elements/Perseverance.glb', function(glb){
        const root = glb.scene;
        root.scale.set(0.65,0.65,0.65)
        scene.add(root)
    },function(xhr){
        console.log((xhr.loaded/xhr.total*100)+ "% loaded")
    },function(error){
        console.log('Error encountered')
    })
}

function AddLights(){
    const light = new THREE.DirectionalLight(0xffffff,1)
    light.position.set(2,2,5)
    scene.add(light)

    const light2 = new THREE.DirectionalLight(0xffffff,1)
    light2.position.set(2,2,-5)
    scene.add(light2)

    const light3 = new THREE.DirectionalLight(0xffffff,1)
    light3.position.set(-2,2,5)
    scene.add(light3)

    const light4 = new THREE.DirectionalLight(0xffffff,1)
    light4.position.set(-2,2,-5)
    scene.add(light4) 

    const light5 = new THREE.DirectionalLight(0xffff00,0.5)
    light5.position.set(0,5,0)
    scene.add(light5) 

    const light6 = new THREE.DirectionalLight(0xffff00,0.5)
    light6.position.set(0,0,0)
    scene.add(light6) 

}

function SetUpRenderer(){
    renderer.setSize(sizes.width,sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled=true
    //renderer.gammaOutput=true
}

function AddEventListeners(){
    document.getElementById('submit').addEventListener('click', setViewPoint);
    document.getElementById('reset').addEventListener('click', resetViewPoint);
    document.getElementById('goToDefault').addEventListener('click', zoomOutToDefaultPosition);
    renderer.domElement.addEventListener( 'click', raycast, false );
}


function generateRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
