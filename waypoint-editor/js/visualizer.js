$(document).ready( init );

var renderer;
var scene;
var camera;
var satellite;

var json;

function init()
{
	renderer = new THREE.WebGLRenderer
	({
		antialias: true,
		canvas: document.querySelector('#main_area'),
	});
	renderer.setClearColor(0x000000, 1);

	//OrthographicCamera
	camera    = new THREE.PerspectiveCamera();
	satellite = new THREE.Satellite( camera );

	resize();	
	window.addEventListener( 'resize', resize );

	setInterval( draw,    50 );
}

function resize()
{
    renderer.setSize(window.innerWidth, window.innerHeight);
    satellite.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function draw()
{	
	scene = new THREE.Scene();

	drawGround( scene )

	if( json !== undefined )
	{
		satellite.setCenter( json[0], json[1], 0.0 );
	}
	satellite.update();
	renderer.clear();
	renderer.render( scene, camera );
}

function drawGround( scene )
{
	var material;
	var geometry;
	var size = 10;


	material = new THREE.MeshBasicMaterial( { color: 0x404040 } );
	geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(-size, -size, 0));
	geometry.vertices.push(new THREE.Vector3(+size, -size, 0));
	geometry.vertices.push(new THREE.Vector3(+size, +size, 0));
	geometry.vertices.push(new THREE.Vector3(-size, +size, 0));
	geometry.faces.push( new THREE.Face3(0,1,2) );
	geometry.faces.push( new THREE.Face3(0,2,3) );
	scene.add( new THREE.Mesh( geometry, material ) );	

 	geometry = new THREE.Geometry();
	for(i = -size; i <= size; ++i)
	{
		geometry.vertices.push(new THREE.Vector3(i, -size, 1e-3));
		geometry.vertices.push(new THREE.Vector3(i, +size, 1e-3));
		geometry.vertices.push(new THREE.Vector3(-size, i, 1e-3));
		geometry.vertices.push(new THREE.Vector3(+size, i, 1e-3));
	}

	material = new THREE.LineBasicMaterial( {color: 0xffffff} );
	scene.add( new THREE.LineSegments( geometry, material ) );
}
