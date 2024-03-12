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
let video;

// Acciones
init();
loadScene();
setupGUI();
render();

function init()
{
    // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.getElementById('container').appendChild( renderer.domElement );
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;

    // Instanciar el nodo raiz de la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5,0.5,0.5);

    // Instanciar la camara
    camera= new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
    camera.position.set(0.5,2,7);
    camera.lookAt( new THREE.Vector3(0,1,0));
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,1,0);
    camera.lookAt(0,1,0);

    // Luces
    const ambiental = new THREE.AmbientLight(0x222222);
    scene.add(ambiental);
    const direccional = new THREE.DirectionalLight(0xFFFFFF,0.3);
    direccional.position.set(-1,1,-1);
    direccional.castShadow = true;
    scene.add(direccional);
    const puntual = new THREE.PointLight(0xFFFFFF,0.5);
    puntual.position.set(2,7,-4);
    scene.add(puntual);
    const focal = new THREE.SpotLight(0xFFFFFF,0.3);
    focal.position.set(-2,7,4);
    focal.target.position.set(0,0,0);
    focal.angle= Math.PI/7;
    focal.penumbra = 0.3;
    focal.castShadow= true;
    focal.shadow.camera.far = 20;
    focal.shadow.camera.fov = 80;
    scene.add(focal);
    scene.add(new THREE.CameraHelper(focal.shadow.camera));

    // Eventos
    window.addEventListener('resize', updateAspectRatio );
    renderer.domElement.addEventListener('dblclick', animate );
}

function loadScene()
{
    // Materiales 
    const path ="./images/";
    const texcubo = new THREE.TextureLoader().load(path+"pisometal.jpg");
    const texsuelo = new THREE.TextureLoader().load(path+"pisometal.jpg");
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
    suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10, 100,100), matsuelo );
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

    scene.add( new THREE.AxesHelper(3) );
    cubo.add( new THREE.AxesHelper(1) );

    const glloader1 = new GLTFLoader();

    glloader1.load( 'models/mclaren/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 0.5;
        gltf.scene.rotation.y = -Math.PI/2;
        gltf.scene.name = 'mclaren';
        esfera.add( gltf.scene );
        gltf.scene.traverse(ob=>{
        if(ob.isObject3D) ob.castShadow = true;
    })

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
		mensaje: 'Mi Coche',
		giroY: 0.0,
		separacion: 0,
		sombras: true,
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
	h.add(effectController, "giroY", -180.0, 180.0, 0.025).name("Giro en Y");
	h.add(effectController, "sombras")
      .onChange(v=>{
        cubo.castShadow = v;
        esfera.castShadow = v;
      });
    h.addColor(effectController, "colorsuelo")
     .name("Color Tarima")
     .onChange(c=>{cubo.material.setValues({color:c})});
    const videofolder = gui.addFolder("Control video");
    videofolder.add(effectController,"mute").onChange(v=>{video.muted = v});
	videofolder.add(effectController,"play");
	videofolder.add(effectController,"pause");

}

function updateAspectRatio()
{
    const ar = window.innerWidth/window.innerHeight;
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect = ar;
    camera.updateProjectionMatrix();
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
    const soldado = scene.getObjectByName('soldado');
    const robot = scene.getObjectByName('robota');
    let intersecciones = rayo.intersectObjects(soldado.children,true);

    if( intersecciones.length > 0 ){
        new TWEEN.Tween( soldado.position ).
        to( {x:[0,0],y:[3,1 ],z:[0,0]}, 2000 ).
        interpolation( TWEEN.Interpolation.Bezier ).
        easing( TWEEN.Easing.Bounce.Out ).
        start();
    }

    intersecciones = rayo.intersectObjects(robot.children,true);

    if( intersecciones.length > 0 ){
        new TWEEN.Tween( robot.rotation ).
        to( {x:[0,0],y:[Math.PI,-Math.PI/2],z:[0,0]}, 5000 ).
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
    renderer.render(scene,camera);
}