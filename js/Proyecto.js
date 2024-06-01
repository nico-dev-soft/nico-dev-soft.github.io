/**
 * EscenaIluminada.js
 * 
 * Practica AGM #3. Escena basica con interfaz, animacion e iluminacion
 * Se trata de añadir luces a la escena y diferentes materiales
 * 
 * @author Brayan Nicolás Aceros Guerrero <bnacegue@upv.edu.es>
 * @date 13/03/2024
 * 
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";

// Variables estandar
let renderer, scene, camera;

// Otras globales
let cameraControls, effectController;
let esferaCubo,cubo,esfera,suelo;
let video,  camaraOrtografica, camaraOrtografica2, camaraOrtografica3 ;

// Luces direccional y focal.
let direccional, focal;
let direccionalHelper, focalHelper;

// Otras
const L = 1.5;
const L2 = 1.8;
const L3 = 2;

// Acciones
init();
loadScene();
setupGUI();
render();


function init()
{
    // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;

     /*******************
    * Habilitar motor de render, el canvas y el buffer de sombras
    *******************/
     document.getElementById('container').appendChild( renderer.domElement );
     renderer.antialias = true;
     renderer.shadowMap.enabled = true;    

    // Instanciar el nodo raiz de la escena
    scene = new THREE.Scene();


    // Instanciar la camara
    camera= new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
    camera.position.set(0.5,2,10);
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,-1,0);

    // Establecer límites de distancia para el zoom
    cameraControls.minDistance = 5; // Establece la distancia mínima a la que la cámara puede alejarse del objetivo
    cameraControls.maxDistance = 20; // Establece la distancia máxima a la que la cámara puede acercarse al objetivo
    camera.lookAt(0,1,0);

    const ar = window.innerWidth/window.innerHeight;
    // Crear y configurar cámaras ortográficas
    if(ar>1) {
        camaraOrtografica = new THREE.OrthographicCamera(-L*ar,L*ar,L,-L,-10,100);
        camaraOrtografica2 = new THREE.OrthographicCamera(-L2*ar,L2*ar,L2,-L2,-10,100);
        camaraOrtografica3 = new THREE.OrthographicCamera(-L3*ar,L3*ar,L3,-L3,-10,100);
    } else {
        camaraOrtografica = new THREE.OrthographicCamera(-L,L,L/ar,-L/ar,-10,100);
        camaraOrtografica2 = new THREE.OrthographicCamera(-L2,L2,L2/ar,-L2/ar,-10,100);
        camaraOrtografica3 = new THREE.OrthographicCamera(-L3,L3,L3/ar,-L3/ar,-10,100);
    }

    // Primera cámara
    camaraOrtografica.position.set(0,4,0.5);
    camaraOrtografica.lookAt(0,0,0);
    camaraOrtografica.up = new THREE.Vector3(0,0,-1);

    // Segunda cámara
    camaraOrtografica2.position.set(0,1,1);
    camaraOrtografica2.lookAt(-4,-1,-3);
    camaraOrtografica2.up = new THREE.Vector3(-10,0,-5);

    // Tercera cámara
    camaraOrtografica3.position.set(0,2,4);
    camaraOrtografica3.lookAt(0,0,0);
    camaraOrtografica3.up = new THREE.Vector3(0,0,-1);

    // Luz ambiental
    const ambiental = new THREE.AmbientLight(0x222222,2.5);
    scene.add(ambiental);

    //Luz direccional
    direccional = new THREE.DirectionalLight(0xFFFFFF,1);
    direccional.position.set(5,6,-5);
    direccional.castShadow = true;
    scene.add(direccional);
    direccionalHelper = new THREE.CameraHelper(direccional.shadow.camera)
    scene.add(direccionalHelper);

    //Luz Focal
    focal = new THREE.SpotLight(0xFFFFFF,0.3);
    focal.position.set(-5,10,5);
    focal.target.position.set(0,0,0);
    focal.angle= Math.PI/7;
    focal.penumbra = 0.3;
    focal.castShadow= true;
    focal.shadow.camera.far = 20;
    focal.shadow.camera.fov = 80;
    scene.add(focal);
    focalHelper = new THREE.CameraHelper(focal.shadow.camera)
    scene.add(focalHelper);

    // Eventos
    window.addEventListener('resize', updateAspectRatio );
    renderer.domElement.addEventListener('dblclick', animate );

}

function loadScene()
{
    // Materiales 
    const path ="./images/";
    const texcubo = new THREE.TextureLoader().load(path+"escenario.jpg");
    const texsuelo = new THREE.TextureLoader().load(path+"suelo.jpg");
    texsuelo.repeat.set(4,3);
    texsuelo.wrapS= texsuelo.wrapT = THREE.MirroredRepeatWrapping;
    const entorno = [ path+"posx.jpg", path+"negx.jpg",
                      path+"posy.jpg", path+"negy.jpg",
                      path+"posz.jpg", path+"negz.jpg"];
    const texesfera = new THREE.CubeTextureLoader().load(entorno);

    const matcubo = new THREE.MeshLambertMaterial({color:'yellow',map:texcubo});
    const matesfera = new THREE.MeshPhongMaterial({color:'white',
                                                   specular:'gray',
                                                   shininess: 30,
                                                   envMap: texesfera });
    const matsuelo = new THREE.MeshStandardMaterial({color:"rgb(150,150,150)",map:texsuelo});

    // Suelo
    suelo = new THREE.Mesh( new THREE.PlaneGeometry(15,15, 100,100), matsuelo );
    suelo.rotation.x = -Math.PI/2;
    suelo.position.y = -0.2;
    suelo.receiveShadow = true;
    scene.add(suelo);

    // Esfera y cubo
    esfera = new THREE.Mesh( new THREE.SphereGeometry(0,0,0), matesfera );
    cubo = new THREE.Mesh( new THREE.BoxGeometry(6,1,6), matcubo );
    esfera.position.x = -1;
    cubo.position.x = 0;
    esfera.castShadow = true;
    esfera.receiveShadow = true;
    cubo.castShadow = cubo.receiveShadow = true;

    esferaCubo = new THREE.Object3D();
    esferaCubo.add(esfera);
    esferaCubo.add(cubo);
    esferaCubo.position.y = 0;

    scene.add(esferaCubo);

    //figuras = [esfera, cubo, esferaCubo, suelo];

    //Objeto coche
    const glloader = new GLTFLoader();

    glloader.load( 'models/mclaren/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 0.5;
        gltf.scene.rotation.y = -Math.PI/2;
        esfera.add( gltf.scene );
        gltf.scene.name = 'mclaren';
   
    }, undefined, function ( error ) {

        console.error( error );

    } );

    
    //Objeto Piloto
    const glloader1 = new GLTFLoader();

    glloader1.load( 'models/racer_girl/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 0.5;
        gltf.scene.position.x = 3;
        gltf.scene.position.z = 2;
        gltf.scene.rotation.y = -Math.PI/10;
        esfera.add( gltf.scene );
        gltf.scene.name = 'pilot';
        // Disminuir el tamaño del personaje
        gltf.scene.scale.set(0.5, 0.5, 0.5); // Aquí puedes ajustar el tamaño según tus necesidades


    }, undefined, function ( error ) {

        console.error( error );

    } );

        //Objeto Drone
        const glloader2 = new GLTFLoader();

        glloader2.load( 'models/drone/scene.gltf', function ( gltf ) {
            gltf.scene.position.y = 4;
            gltf.scene.position.x = -1;
            gltf.scene.position.z = 2;
            gltf.scene.rotation.y = Math.PI/10;
            esfera.add( gltf.scene );
            gltf.scene.name = 'drone';
            // Disminuir el tamaño del drone
            gltf.scene.scale.set(0.05, 0.05, 0.05); // Aquí puedes ajustar el tamaño según tus necesidades
    
    
        }, undefined, function ( error ) {
    
            console.error( error );
    
        } );

    // Habitacion
    const paredes = [];
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negx.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negy.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"posz.jpg")}) );
    paredes.push( new THREE.MeshBasicMaterial({side:THREE.BackSide,
                  map: new THREE.TextureLoader().load(path+"negz.jpg")}) );
    const habitacion = new THREE.Mesh( new THREE.BoxGeometry(40,40,40),paredes);
    scene.add(habitacion);

    // Cine
    video = document.createElement('video');
    video.src = "./videos/McLaren.mp4";
    video.load();
    video.muted = true;
    video.play();
    const texvideo = new THREE.VideoTexture(video);
    const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(10,10,100,100), 
                                    new THREE.MeshBasicMaterial({map:texvideo}));
   
    pantalla.position.set(0,6,-5);
    scene.add(pantalla);
}

function setupGUI()
{
	// Definicion de los controles
	effectController = {
		mensaje: 'Mclaren 720s',
		giroY: 0.0,
        alambric: true,  
        direccionalIntensity: 0.5,
        direccionalPosX: 2,
        direccionalPosY: 5,
        direccionalPosZ: 0,
        focalIntensity: 0.5,        
        focalPosX: 2,
        focalPosY: 5,
        focalPosZ: 0,     
        direccionalShadow: true,
        focalShadow: true,
        enableDireccinalHelper: true,
        enableFocalHelper: true,
		sombras: false,
		play: function(){video.play();},
		pause: function(){video.pause();},
        mute: true,
		colorsuelo: "rgb(150,150,150)"
	};

	// Creacion interfaz
	const gui = new GUI();

	// Construccion del menu
	const h = gui.addFolder("Control Coche Tarima");
	h.add(effectController, "mensaje").name("Aplicacion");
	h.add(effectController, "giroY", -180.0, 180.0, 0.025).name("Rotación");
    h.add(effectController, "sombras").name("Sombras").onChange(function(value) {
        setShadows(value);
    });
    h.addColor(effectController, "colorsuelo")
     .name("Color Tarima")
     .onChange(c=>{cubo.material.setValues({color:c})});
   
    const videofolder = gui.addFolder("Control video");
    videofolder.add(effectController,"mute").onChange(v=>{video.muted = v});
	videofolder.add(effectController,"play");
	videofolder.add(effectController,"pause");
    // Control deslizante para ajustar el volumen
    effectController.volumen = 0.5;
    videofolder.add(effectController, "volumen", 0, 1, 0.01).name("Volumen").onChange(v => {
         video.volume = v;
     });
  
    const hd = gui.addFolder("Luz Direccional");
    hd.close()
    hd.add(effectController, "direccionalIntensity", 0, 1, 0.1).name("Intensidad").onChange(v => {
        direccional.intensity = v;
    });
    hd.add(effectController, "direccionalPosX", -5, 5, 0.5).name("Iluminación desde Eje X      ").onChange(v => {
        direccional.position.x = v;
    });
    hd.add(effectController, "direccionalPosY", 0, 10, 0.5).name("Iluminación desde Eje Y      ").onChange(v => {
        direccional.position.y = v;
    });
    hd.add(effectController, "direccionalPosZ", -5, 5, 0.5).name("Iluminación desde Eje Z      ").onChange(v => {
        direccional.position.z = v;
    });
    hd.add(effectController, "focalShadow").name("Desactivar Sombras   ").onChange(v => {
        direccional.castShadow = v;
    });
    hd.add(effectController, "enableDireccinalHelper").name("Desactivar Ejes   ").onChange(v => {
        if(v){
            scene.add(direccionalHelper);
        }
        else{
            scene.remove(direccionalHelper);
        }
       
    });


    const hf =  gui.addFolder("Luz Focal Tarima");
    hf.close()
    hf.add(effectController, "focalIntensity", 0, 1, 0.1).name("Intensidad").onChange(v => {
        focal.intensity = v;
    });
    hf.add(effectController, "focalPosX", -5, 5, 0.5).name("Iluminación desde Eje X      ").onChange(v => {
        focal.position.x = v;
    });
    hf.add(effectController, "focalPosY", 0, 10, 0.5).name("Iluminación desde Eje Y      ").onChange(v => {
        focal.position.y = v;
    });
    hf.add(effectController, "focalPosZ", -5, 5, 0.5).name("Iluminación desde Eje Z      ").onChange(v => {
        focal.position.z = v;
    });
    hf.add(effectController, "focalShadow").name("Desactivar Sombras   ").onChange(v => {
        focal.castShadow = v;
    });
    hf.add(effectController, "enableFocalHelper").name("Desactivar Ejes   ").onChange(v => {
        if(v){
            scene.add(focalHelper);
        }
        else{
            scene.remove(focalHelper);
        }
    })

    // Función para habilitar o deshabilitar las sombras
    function setShadows(enable) {
        esfera.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = enable;
                object.receiveShadow = enable;
            }
        });
        cubo.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = enable;
                object.receiveShadow = enable;
            }
        });
    }

    const options = {
        texture: 'suelo.jpg', // Textura por defecto
        updateTexture: function() {
            // Actualizar la textura del suelo según la selección del usuario
            suelo.material.map = new THREE.TextureLoader().load('./images/' + options.texture);
            suelo.material.map.needsUpdate = true; // Asegúrate de que la textura se actualice correctamente
        }
    };
    
    // Agregar opciones al menú
    const texturesFolder = gui.addFolder('Texturas Suelo');
    texturesFolder.add(options, 'texture', ['suelo.jpg', 'suelo01.jpg', 'suelo02.jpg']).onChange(options.updateTexture);
    
    // Llamar a la función updateTexture para aplicar la textura por defecto
    options.updateTexture();
   
}



function updateAspectRatio()
{
   // Renueva la relación de aspecto de la camara
    /*******************
    * TO DO: Actualizar relacion de aspecto de ambas camaras
    *******************/
    const ar = window.innerWidth/window.innerHeight;

    // Dimensionar canvas
    renderer.setSize(window.innerWidth,window.innerHeight);

    // Ajustar relacion de aspecto en las diferentes camaras

    camera.aspect = ar;
    camera.updateProjectionMatrix();

    if(ar>1){
        camaraOrtografica.left = -L*ar;
        camaraOrtografica.right = planta.right =perfil.right = L*ar;
        camaraOrtografica.top = planta.top= perfil.top=  L;
        camaraOrtografica.bottom = planta.bottom = perfil.bottom = -L;    

        camaraOrtografica2.left = -L2*ar;
        camaraOrtografica2.right = planta.right =perfil.right = L2*ar;
        camaraOrtografica2.top = planta.top= perfil.top=  L2;
        camaraOrtografica2.bottom = planta.bottom = perfil.bottom = -L2;    

        camaraOrtografica3.left = -L3*ar;
        camaraOrtografica3.right = planta.right =perfil.right = L3*ar;
        camaraOrtografica3.top = planta.top= perfil.top=  L3;
        camaraOrtografica3.bottom = planta.bottom = perfil.bottom = -L3;
    }
    else{
        camaraOrtografica.left = -L;
        camaraOrtografica.right = L;
        camaraOrtografica.top = L/ar;
        camaraOrtografica.bottom = -L/ar;       

        camaraOrtografica2.left = -L2;
        camaraOrtografica2.right = L2;
        camaraOrtografica2.top = L2/ar;
        camaraOrtografica2.bottom = -L2/ar; 

        camaraOrtografica3.left = -L3;
        camaraOrtografica3.right = L3;
        camaraOrtografica3.top = L3/ar;
        camaraOrtografica3.bottom = -L3/ar; 
    }
    camaraOrtografica.updateProjectionMatrix();
    camaraOrtografica2.updateProjectionMatrix();
    camaraOrtografica3.updateProjectionMatrix();
 
}

function animate(event)
{
  // Capturar y normalizar
  let x= event.clientX;
  let y = event.clientY;
  x = ( x / window.innerWidth ) * 2 - 1;
  y = -( y / window.innerHeight ) * 2 + 1;

  // Construir el rayo y detectar la interseccion
  const rayo = new THREE.Raycaster();
  rayo.setFromCamera(new THREE.Vector2(x,y), camera);
  const pilot = scene.getObjectByName('pilot');
  const drone = scene.getObjectByName('drone');


   let intersecciones = rayo.intersectObjects(drone.children,true);

  // Animacion objeto drone
   if( intersecciones.length > 0 ){
      new TWEEN.Tween( drone.position ).
       to( {x:[3,1],y:[5,4],z:[3,0]}, 2000 ).
      interpolation( TWEEN.Interpolation.Bezier).
       easing( TWEEN.Easing.Exponential.Out ).
      start();
   }

   // Animacion objeto pilot 
  intersecciones = rayo.intersectObjects(pilot.children,true);

  if( intersecciones.length > 0 ){
      new TWEEN.Tween( pilot.rotation ).
      to( {x:[0,0],y:[Math.PI,-Math.PI/2],z:[0,0]}, 4000 ).
      interpolation( TWEEN.Interpolation.Linear ).
      easing( TWEEN.Easing.Exponential.InOut ).
      start();
  }

}

function update()
{
	// Lectura de controles en GUI (mejor hacerlo como callback)
	esferaCubo.rotation.y = effectController.giroY * Math.PI/180;
    TWEEN.update();
}

function render()
{
    requestAnimationFrame(render);
    update();

    renderer.setViewport(0 ,0 ,window.innerWidth,window.innerHeight);
    renderer.render( scene, camera );
    renderer.setViewport(3, 6*window.innerHeight/8, window.innerWidth/6,window.innerHeight/6);
    renderer.render( scene, camaraOrtografica );
    renderer.setViewport(3, 4*window.innerHeight/8, window.innerWidth/6,window.innerHeight/6);
    renderer.render( scene, camaraOrtografica2 );
    renderer.setViewport(3, 2*window.innerHeight/8, window.innerWidth/6,window.innerHeight/6);
    renderer.render( scene, camaraOrtografica3 );
    renderer.domElement.addEventListener('click', animate);
  
}

render();