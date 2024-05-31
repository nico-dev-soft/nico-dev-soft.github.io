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

import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";

// Variables de consenso
let renderer, scene, camera;

// Otras globales
/*******************
 * TO DO: Variables globales de la aplicacion
 *******************/
let cameraControls, effectController;
let pentObject;
let figures, cubo, esfera, cone, cylinder, capsule;
let pentShape;
let material;
let model;
let matfigure;
let matesfera;
let matsuelo;
let matcylinder;
let camaraOrto;

// Acciones
init();
loadScene();
setupGUI();
render();

function init()
{
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    /*******************
    * TO DO: Completar el motor de render y el canvas
    *******************/
    document.getElementById('container').appendChild( renderer.domElement );

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5,0.5,0.5);

    // Camara
    //Creamos la cámara perspectiva
    const ar = window.innerWidth/window.innerHeight;
    camera= new THREE.PerspectiveCamera(75,ar,1,100);
    camera.position.set( 0.5, 2, 7 );
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,1,0);
    if(ar>1)
        camaraOrto = new THREE.OrthographicCamera(-L*ar,L*ar,L,-L,-10,100);
    else
        camaraOrto = new THREE.OrthographicCamera(-L,L,L/ar,-L/ar,-10,100);
    camaraOrto.position.set(0,10,0);
    camaraOrto.lookAt(0,0,0);
    camaraOrto.up = new THREE.Vector3(0,0,-1);

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
    renderer.domElement.addEventListener('dblclick', animate );
    
}

function loadScene()
{
     // Materiales 
     const path ="./images/";
     const texcubo = new THREE.TextureLoader().load(path+"wood512.jpg");
     const texsuelo = new THREE.TextureLoader().load(path+"r_256.jpg");
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
 
    const material = new THREE.MeshBasicMaterial( { color: 'yellow', wireframe: true});

    /*******************
    * TO DO: Construir un suelo en el plano XZ
    *******************/
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10, 10,10), material );
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);
    
    /*******************
    * TO DO: Construir una escena con 5 figuras diferentes posicionadas
    * en los cinco vertices de un pentagono regular alredor del origen
    *******************/
    //Creamos los objetos geometricos de las figuras
    cubo = new THREE.Mesh( new THREE.BoxGeometry(2,2,2), matcubo );
    esfera = new THREE.Mesh( new THREE.SphereGeometry( 1, 20,20 ), matesfera );
    cone = new THREE.Mesh( new THREE.ConeGeometry( 1, 5, 8, 1), matcubo );
    cylinder = new THREE.Mesh( new THREE.CylinderGeometry( 1, 1, 2), matcubo );
    capsule = new THREE.Mesh( new THREE.CapsuleGeometry(1, 5, 1), matcubo );

    figures = [cubo, esfera, cone, cylinder, capsule];

    //Creamos la forma del pentagono y posicionamos sobre sus vertices a las figuras
    const pentShape = new THREE.Shape();
    const pentRadius = 4;
    const pentSides = 5;

    for (let i = 0; i < pentSides; i++) {
        let angle = (i / pentSides) * Math.PI * 2;
        let x = Math.cos(angle) * pentRadius;
        let y = Math.sin(angle) * pentRadius;
        if (i === 0) {
            pentShape.moveTo(x, y);
        } else {
            pentShape.lineTo(x, y);
        }
        //Colocamos la figura en la posición
        figures[i].position.x = x;
        figures[i].position.y = y;
    }

    //Creamos la geometría del pentagono
    const geoPent = new THREE.ShapeGeometry( pentShape );
    const pent = new THREE.Mesh( geoPent, material );

    //Hacemos hijos del mesh del pentagono al resto de mesh y los rotamos para que sean paralelos al pentagono
    for(let i = 0; i < figures.length; i++){
        pent.add(figures[i]);
        figures[i].rotation.x = Math.PI / 2;
    }

    //Rotamos el pentagono para que sea paralelo al suelo (también se mueven las figuras para que sean paralelas sobre el plano)
    pent.rotation.x = -Math.PI / 2;

     //Creamos el objeto 3D que representa el pentagono
     pentObject = new THREE.Object3D();
     pentObject.position.x=0;
     pentObject.position.y=1;
     pentObject.position.z=0;
     pentObject.add(pent);
     pentObject.add( new THREE.AxesHelper(1) );

     scene.add(pentObject);

    /*******************
    * TO DO: Añadir a la escena un modelo importado en el centro del pentagono
    *******************/
    const glloader = new GLTFLoader();

    //glloader.load( 'models/RobotExpressive.glb', function ( gltf ) {
        glloader.load( 'models/bender/scene.gltf', function ( gltf ) {
            gltf.scene.position.y = 1;
            gltf.scene.rotation.y = -Math.PI/2;
            pentObject.add( gltf.scene );
            console.log("bender");
            esfera.add( gltf.scene );
            gltf.scene.name = 'bender';
            
        }, undefined, function ( error ) {
        
            console.error( error );
        
        } );

            // Modelos importados
        const loader = new THREE.ObjectLoader();
        loader.load('models/soldado/soldado.json', 
        function (objeto)
        {
            const soldado = new THREE.Object3D();
            soldado.add(objeto);
            cubo.add(soldado);
            soldado.position.y = 1;
            soldado.name = 'soldado';
        });


        const glloader2 = new GLTFLoader();

        //glloader.load( 'models/RobotExpressive.glb', function ( gltf ) {
            glloader2.load( 'models/medieval/scene.gltf', function ( gltf ) {
                gltf.scene.position.y = 0;
                gltf.scene.rotation.y = -Math.PI/2;
                pentObject.add( gltf.scene );
                console.log("medieval");
                gltf.scene.name = 'medieval';
                console.log(gltf);
            
            }, undefined, function ( error ) {
            
                console.error( error );
            
            } );

            const glloader3 = new GLTFLoader();

            //glloader.load( 'models/RobotExpressive.glb', function ( gltf ) {
                glloader3.load( 'models/grace/scene.gltf', function ( gltf ) {
                    gltf.scene.position.y = 0;
                    gltf.scene.rotation.y = -Math.PI/2;
                    capsule.add( gltf.scene );
                    console.log("grace");
                    gltf.scene.name = 'grace';
                    console.log(gltf);
                
                }, undefined, function ( error ) {
                
                    console.error( error );
                
                } );
            //glloader.load( 'models/RobotExpressive.glb', function ( gltf ) {
                glloader3.load( 'models/robota/scene.gltf', function ( gltf ) {
                    gltf.scene.position.y = 1;
                    gltf.scene.rotation.y = -Math.PI/2;
                    cylinder.add( gltf.scene );
                    gltf.scene.name = 'robota';
                    console.log(gltf);
                
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
            // video = document.createElement('video');
            // video.src = "./videos/Pixar.mp4";
            // video.load();
            // video.muted = true;
            // video.play();
            // const texvideo = new THREE.VideoTexture(video);
            // const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(20,6, 4,4), 
            //                                 new THREE.MeshBasicMaterial({map:texvideo}));
            // pantalla.position.set(0,4.5,-5);
            // scene.add(pantalla);


        /*******************
            * TO DO: Añadir a la escena unos ejes
            *******************/
            scene.add( new THREE.AxesHelper(3) );
}
    function setupGUI()
    {
        // Definicion de los controles
        effectController = {
            mensaje: 'Personajes',
            giroY: 0.0,
            separacion: 0,
            colorsuelo: "rgb(150,150,150)"
        };
    
        // Creacion interfaz
        const gui = new GUI();
    
        // Construccion del menu
        const h = gui.addFolder("Control esferaCubo");
        h.add(effectController, "mensaje").name("Aplicacion");
        h.add(effectController, "giroY", -180.0, 180.0, 0.025).name("Giro en Y");
        // h.add(effectController, "separacion", { 'Ninguna': 0, 'Media': 2, 'Total': 5 }).name("Separacion");
        // h.addColor(effectController, "colorsuelo")
        // .name("Color Objeto")
        // .onChange(c=>{figures.material.setValues({color:c})});
    
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
        const robota = scene.getObjectByName('robota');
        const bender = scene.getObjectByName('bender');
        const medieval = scene.getObjectByName('medieval');
        const grace = scene.getObjectByName('grace');


        let intersecciones = rayo.intersectObjects(soldado.children,true);

        // Animacion objeto soldado 
        if( intersecciones.length > 0 ){
            new TWEEN.Tween( soldado.position ).
            to( {x:[0,0],y:[3,1],z:[0,0]}, 2000 ).
            interpolation( TWEEN.Interpolation.Bezier).
            easing( TWEEN.Easing.Bounce.Out ).
            start();
        }

         // Animacion objeto robota 
        intersecciones = rayo.intersectObjects(robota.children,true);

        if( intersecciones.length > 0 ){
            new TWEEN.Tween( robota.rotation ).
            to( {x:[0,0],y:[Math.PI,-Math.PI/2],z:[0,0]}, 5000 ).
            interpolation( TWEEN.Interpolation.Linear ).
            easing( TWEEN.Easing.Exponential.InOut ).
            start();
        }

         // Animacion objeto bender 
        intersecciones = rayo.intersectObjects(bender.children, true);

        if (intersecciones.length > 0) {
        new TWEEN.Tween(bender.rotation)
            .to( {x:[0,0],y:[Math.PI,-Math.PI/2],z:[0,0]}, 5000) 
            .interpolation(TWEEN.Interpolation.Bezier)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    }


      // Animacion objeto medieval 
      intersecciones = rayo.intersectObjects(medieval.children, true);

      if (intersecciones.length > 0) {
      new TWEEN.Tween(medieval.scale)
          .to({ x: [1, 1], y: [0.5, 1], z: [1, 2] }, 3000) 
          .interpolation(TWEEN.Interpolation.Bezier)
          .easing(TWEEN.Easing.Exponential.Out)
          .start();
  }


    // Animacion objeto grece 
    intersecciones = rayo.intersectObjects(grace.children, true);

    if (intersecciones.length > 0) {
    new TWEEN.Tween(grace.rotation)
        .to({x:[0,0],y:[3,1],z:[0,0]}, 2000)
        .interpolation(TWEEN.Interpolation.Bezier)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();
}

    }

function update()
{
    /*******************
    * TO DO: Modificar el angulo de giro de cada objeto sobre si mismo
    * y del conjunto pentagonal sobre el objeto importado
    *******************/
    // Lectura de controles en GUI (es mejor hacerlo con onChange)
    //cubo.material.setValues( { color: effectController.colorsuelo } );
    pentObject.rotation.y = effectController.giroY * Math.PI/180;
    TWEEN.update();
}

function render()
{
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}