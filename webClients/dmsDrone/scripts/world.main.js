
var scene;
var camera;
var renderer;
var container;
var controls;
var clock;
var stats;
var controlEnabled = false;
var cityDimension = 1000;
var materials;
var cityBlocks  =
    [   //cityDimension is 1000, so each block is 100x100
        ['b1', 'b1', 'b1', 'b1', '  ', 'b2', '  ', 'b1', 'b1', 'b1'],    //r = residential
        ['b1', 'b1', 'b1', 'b1', 'b2', 'b2', 'b2', '  ', 'b1', 'b1'],    //b = business
        ['b1', 'b1', 'b1', 'b1', 'b4', '  ', '  ', 'j ', '  ', '  '],    //p = park
        ['b1', 'b1', 'b1', 'b1', 'b4', 'b2', 'b2', 'b4', 'b2', 'b1'],
        ['b1', 'b1', 'b1', 'b1', 'b4', 'b4', 'b4', 'b5', 'b2', 'b1'],
        ['b1', 'b1', 'b1', 'b2', 'b2', 'b4', 'b5', 'b5', 'b2', 'b1'],
        ['b1', 'b1', 'b1', 'b2', 'b4', 'b4', 'b5', 'b4', 'b2', 'b1'],
        ['b1', 'b1', 'b1', 'b2', 'b4', 'b4', 'b4', 'b4', 'b2', 'b1'],
        ['b1', 'b1', 'b1', 'b2', 'b4', 'b4', 'b4', 'b2', 'b1', 'b1'],
        ['b1', 'b1', 'b1', 'b1', 'b2', 'b2', 'b2', 'b1', 'b1', 'b1']
    ];


function initWorld() {

    // create main scene
    scene = new THREE.Scene();

    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight;

    // prepare camera
    var VIEW_ANGLE = 45;
    var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
    var NEAR = 1;
    var FAR = 2000;

    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add( camera );
    this.camera.position.set( cityDimension/2, 100, cityDimension/2 );
    this.camera.lookAt( new THREE.Vector3( cityDimension/2, 0, cityDimension/2 ));

    // prepare renderer
    renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;

    // prepare container
    container = document.getElementById('threeJsRenderArea');
    container.appendChild(this.renderer.domElement);

    // events
    THREEx.WindowResize(this.renderer, camera);

    //stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '50px';
    stats.domElement.style.bottom = '50px';
    stats.domElement.style.zIndex = 1;
    container.appendChild( stats.domElement );

    if (controlEnabled) { //prepare controls (FirstPersonControls        
        controls = new THREE.FirstPersonControls( camera );
        controls.movementSpeed = 20;
        controls.lookSpeed = 0.05;
        controls.lookVertical = true;
    }

    // prepare clock
    clock = new THREE.Clock();

    // add spot light
    var spLight = new THREE.SpotLight(0xffffff,.4, 2000, Math.PI / 3);
    spLight.castShadow = true;
    spLight.position.set(this.cityDimension, 255, this.cityDimension);
    scene.add(spLight);

    // add ambient light
    var aLight = new THREE.AmbientLight(0xafafaf);
    scene.add(aLight);

    //-------------------
    setupBuildingTextures();
    indicateOrigin();
    addSkyBox();    
    addAllBuildings();    
    addPowerLine();
}


function addPowerLine() {
    var x = 187.5, y = 8;
    
    var geometry = new THREE.CylinderGeometry(.15, .15, cityDimension);
    var material = new THREE.MeshBasicMaterial( {color: 0x323232} );
    var cylinder = new THREE.Mesh( geometry, material );
    
    cylinder.position.x = x;
    cylinder.position.y = y;
    cylinder.position.z = cityDimension/2;
    cylinder.rotation.x = Math.PI/2;
    
    scene.add( cylinder );
}

function addAllBuildings() {

    var mergedBuildingGeometry = new THREE.Geometry();
    
    for (var i = 0; i < buildingData.arr.length; i++) {
        var btrx = buildingData.arr[i].btrx;
        var btrz = buildingData.arr[i].btrz;
        var width = buildingData.arr[i].width;
        var height = buildingData.arr[i].height;
        var depth = buildingData.arr[i].depth;
        
        if (i % 8 == 0) {   //merge every 8 buildings together for better performance
            var mesh = new THREE.Mesh(mergedBuildingGeometry, materials);
            scene.add(mesh);
            mergedBuildingGeometry = new THREE.Geometry();
        }

        drawBuilding(mergedBuildingGeometry, btrx, btrz, width, height, depth);
    }
}

function drawBuilding(mergedBuildingGeometry, trx, trz, width, height, depth) {

    var geometry = new THREE.BoxGeometry(width, height, depth);
    geometry.faces.splice( 6, 2 ); //remove bottom face of buildings

    var randTex = Math.floor(Math.random() * 4);
    for (var i = 0; i < geometry.faces.length; i++)  geometry.faces[i].materialIndex = randTex + 1;

    //the roof
    geometry.faces[4].materialIndex = 0;
    geometry.faces[5].materialIndex = 0;

    var building = new THREE.Mesh( geometry );
    building.position.x = trx + width/2;
    building.position.y = height/2;
    building.position.z = trz + depth/2;

    building.updateMatrix();
    THREE.GeometryUtils.merge( mergedBuildingGeometry, building );
}

function setupBuildingTextures() {

    var textures = new Array();

    for (var i = 0; i < 4; i++) {
        var tex = THREE.ImageUtils.loadTexture("textures/buildings/" +  (i + 1) +".jpg");
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(5, 8);
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.LinearMipMapLinearFilter;

        textures[i] = tex;
    }

    materials = new THREE.MeshFaceMaterial([
        new THREE.MeshLambertMaterial( { color: 0xefefef, overdraw: true, shininess: 80 } ),
        new THREE.MeshPhongMaterial( { map: textures[0], overdraw: true, shininess: 80 } ),
        new THREE.MeshPhongMaterial( { map: textures[1], overdraw: true, shininess: 80 } ),
        new THREE.MeshPhongMaterial( { map: textures[2], overdraw: true, shininess: 80 } ),
        new THREE.MeshPhongMaterial( { map: textures[3], overdraw: true, shininess: 80 } ),
    ]);
}

function addSkyBox() {
    var geometry = new THREE.BoxGeometry(1000, 1000, 1000);

    var groundTex = THREE.ImageUtils.loadTexture( 'textures/sb/sb4.jpg');
    groundTex.magFilter = THREE.NearestFilter;

    var material1 = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/sb/sb1.jpg' ), overdraw: true } );
    var material2 = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/sb/sb2.jpg' ), overdraw: true } );
    var material3 = new THREE.MeshBasicMaterial( { color: 0x000000} ); //this is the top, it is never seen
    var material4 = new THREE.MeshBasicMaterial( { map: groundTex, overdraw: true } );
    var material5 = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/sb/sb5.jpg' ), overdraw: true } );
    var material6 = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/sb/sb6.jpg' ), overdraw: true } );

    var materials = [material1, material2, material3, material4, material5, material6];

    geometry.materials = materials;

    var skyBox = new THREE.Mesh( geometry,  new THREE.MeshFaceMaterial(materials) );
    skyBox.position.x = 500;
    skyBox.position.y = 500;
    skyBox.position.z = 500;
    skyBox.scale.set(-1, 1, 1);

    this.scene.add(skyBox);
}

function indicateOrigin() {
    var geometery = new THREE.BoxGeometry(5, 100,5);
    var material = new THREE.MeshBasicMaterial( {color: 0xff0000});
    var line = new THREE.Mesh( geometery, material );
    this.scene.add(line);
}

var totTime = 0;
var altitudeTheta = Math.PI/2;
function updateDrone(x, z, state) {

    if (state == "approachGround" && altitudeTheta > .2)
            altitudeTheta -= .05;
    else if (state != "approachGround" && altitudeTheta < Math.PI/2 )
            altitudeTheta += .05;

    var altitude = 100 * Math.sin(altitudeTheta);

    this.camera.position.set(x, altitude, z);
    this.camera.lookAt(new THREE.Vector3(x, 0, z));
    this.camera.rotation.z = 0;

    totTime += 0.05;
    this.camera.rotation.y = -0.1 * Math.cos(totTime);
    this.camera.rotation.x = -1 + 0.1 * Math.sin(totTime);
}

// Animate the scene
function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

// Update controls and stats
function update() {
    if (controlEnabled) controls.update(clock.getDelta());
    stats.update();
}

// Render the scene
function render() {
    if (renderer) {
        renderer.render(scene, camera);
    }
}

function startWorld() {
    initWorld();
    animate();
}