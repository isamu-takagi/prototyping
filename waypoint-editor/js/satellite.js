THREE.Satellite = function ( object )
{
	var camera = object;
	var width  = 100;
	var height = 100;
	var mode   = 'idle';

	// カメラの状態変数	
	var dist   = 5.0;
	var rot_x  = 0.0;
	var rot_z  = 0.0;
	var center = new THREE.Vector3(0,0,0);

	// カメラの回転行列
	var mat    = new THREE.Matrix4();	
	var mat_x  = new THREE.Matrix4();
	var mat_z  = new THREE.Matrix4();

	// スクリーン上での座標
	var curr   = new THREE.Vector2();
	var prev   = new THREE.Vector2();
	var diff   = new THREE.Vector2();
	
	this.update = function()
	{
		var pos = new THREE.Vector3(0,0,dist);
		var vec = new THREE.Vector3(0,1,0);
		pos.applyMatrix4( mat );
		vec.applyMatrix4( mat );

		pos.add( center );

		camera.position.copy( pos );
		camera.up.copy( vec );
		camera.lookAt( center );
	};
	
	this.setSize = function( wid, hei )
	{
		width  = wid;
		height = hei;
	}
	
	this.setCenter = function( x, y, z )
	{
		center.set( x, y, z );
	}
	
	// 補助関数
	
	function deg2rad( deg )
	{
		return (Math.PI * deg / 180.0);
	}
	
	function touch2dist( event )
	{
		var dx = event.touches[1].pageX - event.touches[0].pageX;
		var dy = event.touches[1].pageY - event.touches[0].pageY;
		return Math.sqrt( dx*dx + dy*dy );
	}
	
	// カメラの回転・拡大縮小・平行移動 ---------------------------------------
	
	function rotate( vec )
	{
		rot_z -= vec.x * Math.PI;
		rot_x -= vec.y * Math.PI;
		rot_x  = Math.max(0.0, Math.min(rot_x, Math.PI / 2.0));
		
		mat_x.makeRotationX( rot_x );
		mat_z.makeRotationZ( rot_z );
		mat.multiplyMatrices( mat_z, mat_x );
	}
	
	function scale( val )
	{
		dist *= (1.0 - val);
	}
	
	function translate( vec )
	{
		vec = new THREE.Vector3( vec.x, -vec.y, 0.0 );
		vec.multiplyScalar( 2.0 * dist );
		vec.multiplyScalar( Math.tan(deg2rad(camera.fov / 2.0)) ); 
		vec.applyMatrix4( mat_z );
		center.sub( vec );
	}
	
	// イベント処理関数 -------------------------------------------------------
	
	function contextmenu( event )
	{
		event.preventDefault();
	}
	
	function mousedown( event )
	{
		prev.x = event.x;
		prev.y = event.y;
		event.preventDefault();
		
		if( event.button === 2 ) { mode = 'mouse_rotate';    }
		if( event.button === 0 ) { mode = 'mouse_translate'; }
	}
	
	function mouseup( event )
	{
		mode = 'idle';
		event.preventDefault();
	}
	
	function mousemove( event )
	{
		curr.x = event.x;
		curr.y = event.y;
		event.preventDefault();
		
		diff.subVectors( curr, prev );
		diff.divideScalar( height );

 		if( mode === 'mouse_rotate'    ) { rotate    ( diff ); }
		if( mode === 'mouse_translate' ) { translate ( diff ); }
		
		prev.copy( curr );
	}
	
	function mousewheel( event )
	{
		if( event.wheelDelta !== undefined )
		{
			scale( Math.max(-0.1, Math.min(event.wheelDelta, 0.1)) );
		}
		else if( event.detail !== undefined )
		{
			scale( Math.max(-0.1, Math.min(event.detail, 0.1)) );
		}
	}
	
	function touchstart( event )
	{
		switch ( event.touches.length )
		{
			case 1:
				mode = 'touch_rotate';
				prev.x = event.touches[0].pageX;
				prev.y = event.touches[0].pageY;
				break;

			case 2:
				mode = 'touch_scale';
				prev.x = event.touches[1].pageX - event.touches[0].pageX;
				prev.y = event.touches[1].pageY - event.touches[0].pageY;
				break;

			case 3:
				mode = 'touch_translate';
				prev.x = event.touches[0].pageX;
				prev.y = event.touches[0].pageY;
				break;

			default:
				mode = 'idle';
				break;
		}
	}

	function touchend( event )
	{
		mode = 'idle';
	}
	
	function touchmove( event )
	{
		event.preventDefault();

		if( mode === 'touch_rotate' || mode === 'touch_translate' )
		{
			curr.x = event.touches[0].pageX;
			curr.y = event.touches[0].pageY;
			diff.subVectors( curr, prev );
			diff.divideScalar( height );
			
	 		if( mode === 'touch_rotate'    ) { rotate    ( diff ); }
			if( mode === 'touch_translate' ) { translate ( diff ); }
		}
		
		if( mode === 'touch_scale' )
		{
			curr.x = event.touches[1].pageX - event.touches[0].pageX;
			curr.y = event.touches[1].pageY - event.touches[0].pageY;
			var delta = curr.length() - prev.length();
			scale( Math.max(-0.04, Math.min(delta, 0.04)) );
		}
		
		prev.copy( curr );
	}
	
	document.addEventListener('contextmenu',    contextmenu, false);
	document.addEventListener('touchstart',     touchstart,  false);
	document.addEventListener('touchend',       touchend,    false);
	document.addEventListener('touchmove',      touchmove,   false);
	document.addEventListener('mousedown',      mousedown,   false);
	document.addEventListener('mouseup',        mouseup,     false);
	document.addEventListener('mousemove',      mousemove,   false);
	document.addEventListener('mousewheel',     mousewheel,  false);
	document.addEventListener('DOMMouseScroll', mousewheel,  false);
}

THREE.Satellite.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.Satellite.prototype.constructor = THREE.Satellite;