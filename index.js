/**
 * Created by 10206072 on 2017/8/11.
 */
$( function () {
    var container, stats, clock;
    var camera, scene, renderer, controls, raycaster;
    var line, lineHeight, lineAnimateBeginInterval, linePhysicPositionYBefore, linePoolPositionYBefore,
        linePhysicPositionYAfter, linePoolPositionYAfter;
    var planePool, planePhysic;
    var mouse = new THREE.Vector2(), INTERSECTED;
    var mouseX = 0, mouseY = 0;
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    init();
    animate();

    function init() {
        container = document.getElementById( 'glContainer' );

        raycaster = new THREE.Raycaster();

        clock = new THREE.Clock();

        scene = new THREE.Scene();
        // scene.fog = new THREE.FogExp2(0x000000, 0.0008);

        // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera = new THREE.OrthographicCamera( window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -500, 1000 );
        camera.position.x = 50;
        camera.position.y = 50;
        camera.position.z = 200;
        // scene.add(new THREE.CameraHelper(camera));

        // var gridHelper = new THREE.GridHelper(1000, 10);
        // scene.add(gridHelper);
        // var axisHelper = new THREE.AxisHelper(5);
        // scene.add(axisHelper);

        // var geometry = new THREE.CylinderGeometry(20, 20, 100, 32);
        // var material = new THREE.MeshLambertMaterial({
        //     transparent: true,
        //     opacity: 0.5,
        //     color: '#ce6821',
        //     emissive: '#ff0003',
        //     wireframe: false,
        // });
        // var cylinder = new THREE.Mesh(geometry, material);
        // scene.add(cylinder);

        // var sphereGeometry = new THREE.SphereGeometry(100, 32, 32);
        // var sphereMaterial = new THREE.MeshLambertMaterial({
        //     transparent: true,
        //     opacity: 0.5,
        //     color: '#ce6821',
        //     // emissive: '#ff0003',
        //     wireframe: false,
        // });
        // var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        // scene.add(sphere);


        var physicBoxNumSZ = 96;
        var physicBoxNumNJ = 112;
        var physicBoxNumXA = 120;
        var xNum = 3;
        var yNum = 6;
        generatePhysicBox( xNum, yNum, physicBoxNumSZ, -500 );
        generatePhysicBox( xNum, yNum, physicBoxNumNJ, -100 );
        generatePhysicBox( xNum, yNum, physicBoxNumXA, 300 );

        var data = [ '健康: 42', '正常: 51', '亚健康: 12', '恶劣: 5' ];
        generatePhysicBoxCondition( data, -400 - 112, 50 * (parseInt( physicBoxNumSZ / xNum / yNum ) + 1), physicBoxNumSZ, 0 );
        generatePhysicBoxCondition( data, 0 - 112, 50 * (parseInt( physicBoxNumNJ / xNum / yNum ) + 1), physicBoxNumNJ, 1000 );
        generatePhysicBoxCondition( data, 400 - 112, 50 * (parseInt( physicBoxNumXA / xNum / yNum ) + 1), physicBoxNumXA, 2000 );

        generatePlane( physicBoxNumSZ, physicBoxNumNJ, physicBoxNumXA, xNum, yNum );

        generatePoolBox();

        generateCanvasPlane( '深圳', 100, 30, -400, 340, 0 );
        generateCanvasPlane( '南京', 100, 30, 0, 340, 0 );
        generateCanvasPlane( '西安', 100, 30, 400, 340, 0 );

        generateKvmBox( -400, 600, 0 );
        generateKvmBox( 0, 600, 500 );
        generateKvmBox( 400, 600, 1000 );

        line = [];
        linePhysicPositionYBefore = 270;
        linePoolPositionYBefore = 0;
        lineHeight = 150;
        lineAnimateBeginInterval = 70;
        linePhysicPositionYAfter = linePhysicPositionYBefore - lineHeight;
        linePoolPositionYAfter = linePoolPositionYBefore - lineHeight;
        line[ 0 ] = generateLine( -400, linePhysicPositionYBefore, 0, 0 );
        line[ 1 ] = generateLine( 0, linePhysicPositionYBefore, 0, 0 );
        line[ 2 ] = generateLine( 400, linePhysicPositionYBefore, 0, 0 );

        line[ 3 ] = generateLine( -400, linePoolPositionYBefore, 0, 0 );
        line[ 4 ] = generateLine( 0, linePoolPositionYBefore, 0, 5 );
        line[ 5 ] = generateLine( 400, linePoolPositionYBefore, 0, 0 );

        generateSpotLight( -900, 500, 100 );
        generateSpotLight( 900, 500, 100 );
        generateSpotLight( 0, 500, 100 );


        // scene.add(new THREE.AmbientLight(0x000000));
        // directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        // directionalLight.position.set(window.innerWidth / -2, window.innerWidth / 2, 0);
        // var directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
        // scene.add(directionalLightHelper);
        // scene.add(directionalLight);

        renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild( renderer.domElement );

        // performance monitor
        stats = new Stats();
        container.appendChild( stats.dom );

        // controls
        // controls = new THREE.OrbitControls(camera, renderer.domElement);
        // controls.maxPolarAngle = Math.PI * 0.5;
        // controls.minDistance = 1;
        // controls.maxDistance = 7500;
        controls = new THREE.OrbitControls( camera, renderer.domElement );
        // controls.enableZoom = false;
        // controls.minAzimuthAngle = -Math.PI / 4; // radians
        // controls.maxAzimuthAngle = Math.PI / 4; // radians
        // controls.autoRotate = true;
        // controls.autoRotateSpeed = 4.0;
        // controls.target.set(0, 0, 0);
        // controls.enableDamping = true;
        controls.addEventListener( 'change', render );
        // controls.update();

        // mouse action
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        // document.addEventListener('touchstart', onDocumentTouchStart, false);
        // document.addEventListener('touchmove', onDocumentTouchMove, false);
        window.addEventListener( 'resize', onWindowResize, false );

    }

    function generatePlane( physicBoxNumSZ, physicBoxNumNJ, physicBoxNumXA, xNum, yNum ) {
        var planeGeometryPool = new THREE.PlaneGeometry( 200, 300 );
        var planeGeometryPhysic = [];
        planeGeometryPhysic[ 0 ] = new THREE.PlaneGeometry( 100 * (parseInt( physicBoxNumSZ / xNum / yNum ) + 1), 300 );
        planeGeometryPhysic[ 1 ] = new THREE.PlaneGeometry( 100 * (parseInt( physicBoxNumNJ / xNum / yNum ) + 1), 300 );
        planeGeometryPhysic[ 2 ] = new THREE.PlaneGeometry( 100 * (parseInt( physicBoxNumXA / xNum / yNum ) + 1), 300 );
        var planeMaterialPool = new THREE.MeshPhongMaterial( {
            color: '#09897a',
            emissive: '#043430',
            side: THREE.DoubleSide,
            shading: THREE.FlatShading
        } );
        var planeMaterialPhysic = new THREE.MeshPhongMaterial( {
            color: '#156289',
            emissive: '#072534',
            side: THREE.DoubleSide,
            shading: THREE.FlatShading
        } );
        planePool = [];
        planePhysic = [];
        for ( var i = 0; i < 3; i++ ) {
            planePool[ i ] = new THREE.Mesh( planeGeometryPool, planeMaterialPool );
            planePool[ i ].position.set( -400 + i * 400, -250, 800 );
            planePool[ i ].rotation.x += Math.PI / 2;
            planePool[ i ].rotation.z += Math.PI / 2;
            // planePool[i].receiveShadow = true;
            scene.add( planePool[ i ] );
            new TWEEN.Tween( planePool[ i ].position )
                .to( { z: 0 }, 8000 )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .delay( 3000 + 1000 * i )
                .onUpdate( function ( obj ) {
                } )
                .start();
            planePhysic[ i ] = new THREE.Mesh( planeGeometryPhysic[ i ], planeMaterialPhysic );
            planePhysic[ i ].position.set( -400 + i * 400, 0, 800 );
            planePhysic[ i ].rotation.x += Math.PI / 2;           //欧拉角旋转坐标系也跟着变动
            planePhysic[ i ].rotation.z += Math.PI / 2;
            planePhysic[ i ].receiveShadow = true;
            scene.add( planePhysic[ i ] );
            new TWEEN.Tween( planePhysic[ i ].position )
                .to( { z: 0 }, 8000 )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .delay( 1000 + 1000 * i )
                .onUpdate( function ( obj ) {
                } )
                .start();
        }
    }

    function generatePhysicBox( xNum, yNum, physicBoxNum, xPosition ) {
        var physicBox = [];
        var cubeGeometryPhysic = new THREE.BoxGeometry( 50, 20, 50 );
        var cubeMaterialPhysic = new THREE.MeshPhongMaterial( {
            transparent: true,
            opacity: 0.7,
            color: '#0967a2',
            emissive: '#08387b',
            side: THREE.DoubleSide,
            shading: THREE.FlatShading
        } );
        var zNum = parseInt( physicBoxNum / xNum / yNum );
        var zNumLast = physicBoxNum % (xNum * yNum);
        for ( var k = 0; k < zNum; k++ ) {
            for ( var j = 0; j < xNum; j++ ) {
                for ( var i = 0; i < yNum; i++ ) {
                    physicBox[ i ] = new THREE.Mesh( cubeGeometryPhysic, cubeMaterialPhysic );
                    physicBox[ i ].position.set( xPosition + 100 * j, 40 + 20 * i, 100 * zNum / 2 - 100 * k );
                    physicBox[ i ].castShadow = true;
                    // physicBox[i].visible = false;
                    scene.add( physicBox[ i ] );
                    new TWEEN.Tween( physicBox[ i ].position )
                        .to( { y: 10 + 20 * i }, 5000 )
                        .easing( TWEEN.Easing.Quadratic.InOut )
                        .delay( 200 * i * j * k )
                        .onUpdate( function ( obj ) {
                            // physicBox[i].visible = true;
                            // physicBox[i].position.y = obj.y
                        } )
                        .start();
                }
            }
        }
        for ( var j = 0; j < parseInt( zNumLast / yNum ); j++ ) {
            for ( var i = 0; i < yNum; i++ ) {
                physicBox[ i ] = new THREE.Mesh( cubeGeometryPhysic, cubeMaterialPhysic );
                physicBox[ i ].position.set( xPosition + 100 * j, 40 + 20 * i, 100 * zNum / 2 - 100 * zNum );
                physicBox[ i ].castShadow = true;
                scene.add( physicBox[ i ] );
                new TWEEN.Tween( physicBox[ i ].position )
                    .to( { y: 10 + 20 * i }, 5000 )
                    .easing( TWEEN.Easing.Quadratic.InOut )
                    .delay( 200 * i * j * zNum )
                    .start();
            }
        }
        for ( var i = 0; i < zNumLast % yNum; i++ ) {
            physicBox[ i ] = new THREE.Mesh( cubeGeometryPhysic, cubeMaterialPhysic );
            physicBox[ i ].position.set( xPosition + 100 * parseInt( zNumLast / yNum ), 40 + 20 * i, 100 * zNum / 2 - 100 * zNum );
            physicBox[ i ].castShadow = true;
            scene.add( physicBox[ i ] );
            new TWEEN.Tween( physicBox[ i ].position )
                .to( { y: 10 + 20 * i }, 5000 )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .delay( 200 * i * parseInt( zNumLast / yNum ) * zNum )
                .start();
        }
    }

    function generatePhysicBoxCondition( data, positionX, positionZ, totalNum, delay ) {
        var color = [ '#0b4c5b', '#4a453a', '#4a3939', '#4a263a' ];
        for ( var i = 0; i < 4; i++ ) {
            var canvas = document.createElement( 'canvas' );
            var context = canvas.getContext( '2d' );
            var text = data[ i ];
            context.font = 'normal 55px Arail';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = color[ i ];
            context.fillRect( 0, 0, canvas.width, canvas.height );
            context.fillStyle = 'white';
            context.fillText( text, canvas.width * 0.5, canvas.height * 0.5 );
            var texture = new THREE.Texture( canvas );
            texture.needsUpdate = true;
            var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 70, 30 ),
                new THREE.MeshBasicMaterial( {
                    transparent: true,
                    opacity: 0,
                    map: texture,
                    side: THREE.DoubleSide
                } ) );
            mesh.position.set( positionX + 75 * i, -25 + 50, positionZ );
            scene.add( mesh );
            new TWEEN.Tween( mesh.position )
                .to( { y: -25 }, 8000 )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .delay( 1000 + 1000 * i + delay )
                .onUpdate( function ( obj ) {
                } )
                .start();
            new TWEEN.Tween( mesh.material )
                .to( { opacity: 1 }, 8000 )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .delay( 1000 + 1000 * i + delay )
                .onUpdate( function ( obj ) {
                } )
                .start();
        }
        var canvas = document.createElement( 'canvas' );
        var context = canvas.getContext( '2d' );
        var text = '••• 共' + totalNum + '台';
        context.font = 'normal 55px Arail';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#0fb8fb';
        context.fillText( text, canvas.width * 0.5, canvas.height * 0.5 );
        var texture = new THREE.Texture( canvas );
        texture.needsUpdate = true;
        var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 70, 30 ),
            new THREE.MeshBasicMaterial( {
                transparent: true,
                opacity: 0,
                map: texture,
                side: THREE.DoubleSide
            } ) );
        mesh.position.set( positionX + 75 * i - 25, -25 + 75, 0 );
        scene.add( mesh );
        new TWEEN.Tween( mesh.position )
            .to( { x: positionX + 75 * i }, 8000 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .delay( 1000 + 1000 * i + delay )
            .onUpdate( function ( obj ) {
            } )
            .start();
        new TWEEN.Tween( mesh.material )
            .to( { opacity: 1 }, 8000 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .delay( 1000 + 1000 * i + delay )
            .onUpdate( function ( obj ) {
            } )
            .start();
    }

    function generatePoolBox() {
        var cubeGeometryPoolTrans = new THREE.BoxGeometry( 50, 100, 50 );
        var cubeMaterialPoolTrans = new THREE.MeshPhongMaterial( {
            transparent: true,
            opacity: 0.5,
            color: '#07a069',
            emissive: '#095466',
            side: THREE.DoubleSide,
            shading: THREE.FlatShading
        } );
        var cubeMaterialPool = new THREE.MeshPhongMaterial( {
            transparent: true,
            opacity: 0.5,
            color: '#07a069',
            emissive: '#095466',
            side: THREE.DoubleSide,
            shading: THREE.FlatShading
        } );
        var cubeTrans = [];
        var cube = [];
        var type = [ 'CPU', '内存', '存储' ];
        for ( var i = 0; i < 3; i++ ) {
            cubeTrans[ i ] = new THREE.Mesh( cubeGeometryPoolTrans, cubeMaterialPoolTrans );
            cubeTrans[ i ].position.set( -500 + i * 100, -200, 0 );
            scene.add( cubeTrans[ i ] );
            var height = 35 + Math.random() * 50;
            cube[ i ] = new THREE.Mesh( new THREE.BoxGeometry( 50, height, 50 ), cubeMaterialPool );
            cube[ i ].position.set( -500 + i * 100, -250, 0 );
            scene.add( cube[ i ] );
            new TWEEN.Tween( cube[ i ].position )
                .to( { y: -250 + height / 2 }, 8000 )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .delay( 1000 + 1000 * i )
                .onUpdate( function ( obj ) {
                } )
                .start();
            new TWEEN.Tween( cube[ i ].material )
                .to( { opacity: 0.8 }, 8000 )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .delay( 1000 + 1000 * i )
                .onUpdate( function ( obj ) {
                } )
                .start();
            showUsageRate( height, -500 + i * 100, type[ i ] );
        }
        for ( var i = 3; i < 6; i++ ) {
            cubeTrans[ i ] = new THREE.Mesh( cubeGeometryPoolTrans, cubeMaterialPoolTrans );
            cubeTrans[ i ].position.set( -400 + i * 100, -200, 0 );
            scene.add( cubeTrans[ i ] );
            var height = 35 + Math.random() * 50;
            cube[ i ] = new THREE.Mesh( new THREE.BoxGeometry( 50, height, 50 ), cubeMaterialPool );
            cube[ i ].position.set( -400 + i * 100, -250, 0 );
            scene.add( cube[ i ] );
            new TWEEN.Tween( cube[ i ].position )
                .to( { y: -250 + height / 2 }, 8000 )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .delay( 1500 + 1000 * i )
                .onUpdate( function ( obj ) {
                } )
                .start();
            new TWEEN.Tween( cube[ i ].material )
                .to( { opacity: 0.8 }, 8000 )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .delay( 1500 + 1000 * i )
                .onUpdate( function ( obj ) {
                } )
                .start();
            showUsageRate( height, -400 + i * 100, type[ i - 3 ] );
        }
        for ( var i = 6; i < 9; i++ ) {
            cubeTrans[ i ] = new THREE.Mesh( cubeGeometryPoolTrans, cubeMaterialPoolTrans );
            cubeTrans[ i ].position.set( -300 + i * 100, -200, 0 );
            scene.add( cubeTrans[ i ] );
            var height = 35 + Math.random() * 50;
            cube[ i ] = new THREE.Mesh( new THREE.BoxGeometry( 50, height, 50 ), cubeMaterialPool );
            cube[ i ].position.set( -300 + i * 100, -250, 0 );
            scene.add( cube[ i ] );
            new TWEEN.Tween( cube[ i ].position )
                .to( { y: -250 + height / 2 }, 8000 )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .delay( 2000 + 1000 * i )
                .onUpdate( function ( obj ) {
                } )
                .start();
            new TWEEN.Tween( cube[ i ].material )
                .to( { opacity: 0.8 }, 8000 )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .delay( 2000 + 1000 * i )
                .onUpdate( function ( obj ) {
                } )
                .start();
            showUsageRate( height, -300 + i * 100, type[ i - 6 ] );
        }
    }

    function generateKvmBox( x, y, delay ) {
        // var materials = [];
        var cubeGeometryKvmBox = new THREE.BoxGeometry( 120, 30, 110 );
        var cubeMaterialKvmBoxNormal = new THREE.MeshPhongMaterial( {
            transparent: true,
            opacity: 0.5,
            color: '#0967a2',
            emissive: '#08387b',
            side: THREE.DoubleSide,
            shading: THREE.FlatShading
        } );
        var cubeMaterialKvmBoxAlarm = new THREE.MeshPhongMaterial( {
            transparent: true,
            opacity: 0.5,
            color: '#983532',
            emissive: '#602734',
            side: THREE.DoubleSide,
            shading: THREE.FlatShading
        } );
        // 给立方体不同面附上不同的材质
        // var canvas = document.createElement('canvas');
        // var context = canvas.getContext('2d');
        // var text = 'KVM';
        // context.font = 'Bold 45px Arail';
        // context.fillStyle = 'white';
        // context.textAlign = 'center';
        // context.textBaseline = 'middle';
        // context.fillText(text, canvas.width * 0.5, canvas.height * 0.5);
        // var texture = new THREE.Texture(canvas);
        // texture.needsUpdate = true;
        // materials.push(new THREE.MeshPhongMaterial({
        //     transparent: true,
        //     map: texture,
        //     side: THREE.DoubleSide
        // }));
        // for (var i = 0; i < 5; i++) {
        //     materials.push(cubeMaterialKvmBoxAlarm);
        // }
        var kvmBox = [];
        var kvmBoxData = [ 'VMC1', 'VMC2', 'VMC3' ];
        for ( var i = 0; i < 2; i++ ) {
            kvmBox[ i ] = new THREE.Mesh( cubeGeometryKvmBox, cubeMaterialKvmBoxNormal );
            kvmBox[ i ].position.set( x, y - 30 * i, 0 );
            scene.add( kvmBox[ i ] );
            generateCanvasPlane( kvmBoxData[ i ], 120, 30, x, y - 30 * i - 300, 55, delay );
        }
        // kvmBox[2] = new THREE.Mesh(cubeGeometryKvmBox, new THREE.MeshFaceMaterial(materials));
        kvmBox[ 2 ] = new THREE.Mesh( cubeGeometryKvmBox, cubeMaterialKvmBoxAlarm );
        kvmBox[ 2 ].position.set( x, y - 30 * 2, 0 );
        scene.add( kvmBox[ 2 ] );
        generateCanvasPlane( kvmBoxData[ 2 ], 120, 30, x, y - 30 * 2 - 300, 55, delay );
        new TWEEN.Tween( kvmBox[ 0 ].position )
            .to( { y: y - 30 * 0 - 300 }, 5000 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .delay( 1000 + delay )
            .start();
        new TWEEN.Tween( kvmBox[ 1 ].position )
            .to( { y: y - 30 * 1 - 300 }, 5000 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .delay( 500 + delay )
            .start();
        new TWEEN.Tween( kvmBox[ 2 ].position )
            .to( { y: y - 30 * 2 - 300 }, 5000 )
            .easing( TWEEN.Easing.Quadratic.InOut )
            .delay( delay )
            .start();
    }

    function generateLine( x, y, z, h ) {
        var lineMaterial = new THREE.LineDashedMaterial( {
            transparent: true,
            opacity: 1,
            color: 0xffffff,
            linewidth: 1,
            scale: 1,
            dashSize: 3,
            gapSize: 1,
        } );
        var lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            new THREE.Vector3( x, y, z ),
            new THREE.Vector3( x, y - h, z )
        );
        lineGeometry.computeLineDistances();
        var line = new THREE.Line( lineGeometry, lineMaterial );
        scene.add( line );
        line.geometry.vertices[ 0 ].y -= 1;
        line.geometry.verticesNeedUpdate = true;
        // new TWEEN.Tween(line.material)
        //     .to({opacity: 1}, 5000)
        //     .easing(TWEEN.Easing.Quadratic.Out)
        //     .delay(0)
        //     .start();
        return line;
    }

    function generateSpotLight( x, y, z ) {
        var light = new THREE.SpotLight( 0xffffff, 1 );
        light.position.set( x, y, z );
        // light.target = cube[0];
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.near = 500;
        light.shadow.camera.far = 4000;
        light.shadow.camera.fov = 75;
        scene.add( light );
        // scene.add(new THREE.SpotLightHelper(light));
        // scene.add(new THREE.CameraHelper(light.shadow.camera));
    }

    function generatePointLight( x, y, z ) {
        var light = new THREE.PointLight( 0xffffff, 0.5, 0 );
        light.position.set( x, y, z );
        scene.add( light );
        // scene.add(new THREE.PointLightHelper(lights[0], 1));
    }

    function generateDirectLight( x, y, z ) {
        var light = new THREE.DirectionalLight( 0xffffff, 1 );
        light.position.set( x, y, z );
        // light.target = cubeTrans[0];
        light.castShadow = true;
        light.shadowCameraNear = -500;
        light.shadowCameraFar = 500;
        light.shadowCameraLeft = -500;
        light.shadowCameraRight = 500;
        light.shadowCameraTop = 500;
        light.shadowCameraBottom = -500;
        light.shadowMapHeight = 1024;
        light.shadowMapWidth = 1024;
        scene.add( light );
        // scene.add(new THREE.DirectionalLightHelper(light, 100));
        // scene.add(new THREE.CameraHelper(light.shadow.camera));
    }

    function showUsageRate( rate, positionX, type ) {
        var canvas = document.createElement( 'canvas' );
        var context = canvas.getContext( '2d' );
        var text = rate.toFixed( 0 ) + '%';
        context.font = 'Bold 45px Arail';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText( type, canvas.width * 0.5, canvas.height * 0.2 );
        context.fillText( text, canvas.width * 0.5, canvas.height * 0.5 );
        var texture = new THREE.Texture( canvas );
        texture.needsUpdate = true;
        var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 50, rate ),
            new THREE.MeshBasicMaterial( {
                transparent: true,
                map: texture,
                side: THREE.DoubleSide
            } ) );
        mesh.position.set( positionX, -250 + rate / 2, 25 );
        scene.add( mesh );
    }

    function generateCanvasPlane( text, width, height, positionX, positionY, positionZ, delay ) {
        var canvas = document.createElement( 'canvas' );
        var context = canvas.getContext( '2d' );
        context.font = 'normal 55px Arail';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'white';
        context.fillText( text, canvas.width * 0.5, canvas.height * 0.5 );
        var texture = new THREE.Texture( canvas );
        texture.needsUpdate = true;
        var mesh = new THREE.Mesh( new THREE.PlaneGeometry( width, height ),
            new THREE.MeshBasicMaterial( {
                transparent: true,
                opacity: 0,
                map: texture,
                side: THREE.DoubleSide
            } ) );
        mesh.position.set( positionX, positionY, positionZ );
        scene.add( mesh );
        if ( delay != null ) {
            new TWEEN.Tween( mesh.material )
                .to( { opacity: 1 }, 5000 )
                .easing( TWEEN.Easing.Quadratic.InOut )
                .delay( 5000 + delay )
                .start();
        } else {
            mesh.material.opacity = 1;
        }
    }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function onDocumentMouseMove( event ) {
        event.preventDefault();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
    }

    function onDocumentTouchStart( event ) {
        if ( event.touches.length === 1 ) {
            event.preventDefault();
            mouseX = event.touches[ 0 ].pageX - windowHalfX;
            mouseY = event.touches[ 0 ].pageY - windowHalfY;
        }
    }

    function onDocumentTouchMove( event ) {
        if ( event.touches.length === 1 ) {
            event.preventDefault();
            mouseX = event.touches[ 0 ].pageX - windowHalfX;
            mouseY = event.touches[ 0 ].pageY - windowHalfY;
        }
    }

    function animate() {
        requestAnimationFrame( animate );
        render();
        stats.update();
        TWEEN.update();
        // 控制相机旋转角度
        // if (controls.getAzimuthalAngle() > -Math.PI / 8 && controls.getAzimuthalAngle() < Math.PI / 8) {
        //     controls.update(clock.getDelta());
        // } else {
        //     controls.reset();
        //     controls.update(clock.getDelta());
        // }
    }

    function render() {

        camera.updateMatrixWorld();

        // find intersections 获取鼠标焦点，改变焦点材质颜色》使用同一材质的物体颜色都会改变 没有HexColor的物体可能会出错
        // raycaster.setFromCamera( mouse, camera );
        // var intersects = raycaster.intersectObjects( scene.children );
        // if ( intersects.length > 0 ) {
        //     if ( INTERSECTED != intersects[ 0 ].object ) {
        //         if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        //         INTERSECTED = intersects[ 0 ].object;
        //         INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        //         INTERSECTED.material.emissive.setHex( 0xff0000 );
        //     }
        // } else {
        //     if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        //     INTERSECTED = null;
        // }

        // line animation
        for ( var i = 0; i < 6; i++ ) {
            if ( (line[ i ].geometry.vertices[ 0 ].y > linePhysicPositionYAfter && i == 0) || (line[ i ].geometry.vertices[ 0 ].y > linePhysicPositionYAfter && line[ i - 1 ].geometry.vertices[ 0 ].y < linePhysicPositionYBefore - lineAnimateBeginInterval && i > 0) ) {
                line[ i ].geometry.vertices[ 0 ].y -= 5;
                line[ i ].geometry.verticesNeedUpdate = true;
                line[ i ].geometry.lineDistancesNeedUpdate = true;
                line[ i ].geometry.computeLineDistances();
            }
            else if ( (i == 3 && line[ i ].geometry.vertices[ 0 ].y > linePoolPositionYAfter && line[ i - 1 ].geometry.vertices[ 0 ].y < linePhysicPositionYBefore - lineAnimateBeginInterval) || (i > 3 && line[ i ].geometry.vertices[ 0 ].y > linePoolPositionYAfter && line[ i - 1 ].geometry.vertices[ 0 ].y < linePoolPositionYBefore - lineAnimateBeginInterval) ) {
                line[ i ].geometry.vertices[ 0 ].y -= 5;
                line[ i ].geometry.verticesNeedUpdate = true;
                line[ i ].geometry.lineDistancesNeedUpdate = true;
                line[ i ].geometry.computeLineDistances();
            }
        }

        renderer.render( scene, camera );
    };

} );