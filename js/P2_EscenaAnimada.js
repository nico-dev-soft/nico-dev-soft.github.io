/**
 * EscenaAnimada.js
 * 
 * Practica AGM #2. Escena basica con interfaz y animacion
 * Se trata de añadir un interfaz de usuario que permita 
 * disparar animaciones sobre los objetos de la escena con Tween
 * 
 * @author <bnacegue@upv.es>, 2024
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
let figures;
let model;
let angulo = 0;

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
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1,1000);
    camera.position.set( 0.5, 2, 7 );
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,1,0);
    camera.lookAt( new THREE.Vector3(0,1,0) );

    // Eventos
    renderer.domElement.addEventListener('dblclick', animate );
}

function loadScene()
{
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
    const geoCubo = new THREE.BoxGeometry( 2,2,2 );
    const geoEsfera = new THREE.SphereGeometry( 1, 20,20 );
    const geoCone = new THREE.ConeGeometry( 1, 5, 8, 1);
    const geoCylinder = new THREE.CylinderGeometry( 1, 1, 2);
    const geoCapsule = new THREE.CapsuleGeometry(1, 5, 1);
    //Creamos la mesh con la geometría y el material
    
    const cubo = new THREE.Mesh( geoCubo, material );
    const esfera = new THREE.Mesh( geoEsfera, material );
    const cone = new THREE.Mesh( geoCone, material );
    const cylinder = new THREE.Mesh( geoCylinder, material );
    const capsule = new THREE.Mesh( geoCapsule, material );
    figures = [cubo, esfera, cone, cylinder, capsule];


    //Creamos la forma del pentagono y posicionamos sobre sus vertices a las figuras
    const pentShape = new THREE.Shape();
    const pentRadius = 4;
    const pentSides = 5;

    for (let i = 0; i < pentSides; i++) {
        let angle = (i / pentSides) * Math.PI * 2;
        //let angle = (i / pentSides) * (-Math.PI/2);
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
        h.add(effectController, "separacion", { 'Ninguna': 0, 'Media': 2, 'Total': 5 }).name("Separacion");
        h.addColor(effectController, "colorsuelo")
        .name("Color Objeto")
        .onChange(c=>{figures.material.setValues({color:c})});
    
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
    // angulo += 0.01;
    // pentObject.rotation.y = angulo;
    // for(let i = 0; i < figures.length; i++){
    //     figures[i].rotation.y = angulo
    // }
    // try{
    //     model.rotation.y = angulo;
    // }
    // catch{
    //     console.log("El modelo no se ha cargado")
    // }

    // Lectura de controles en GUI (es mejor hacerlo con onChange)

    //esferaCubo.rotation.y = angulo;

    // Lectura de controles en GUI (es mejor hacerlo con onChange)
    pentObject.rotation.y = effectController.giroY * Math.PI/180;
    TWEEN.update();
}


function render()
{
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}