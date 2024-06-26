// Basic setup
let scene = new THREE.Scene();
let camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 1000);
camera.position.z = 1;

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load the texture and create the mesh
let textureLoader = new THREE.TextureLoader();
textureLoader.load('2.jpg', function(texture) {
    let geometry = new THREE.PlaneGeometry(texture.image.width, texture.image.height);
    let material = new THREE.MeshBasicMaterial({ map: texture });
    let mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let isDragging = false;
    let previousMousePosition = {
        x: 0,
        y: 0
    };

    let lastCenter = null;
    let lastDist = 0;

    function getCenter(p1, p2) {
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
        };
    }

    function getDistance(p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    renderer.domElement.addEventListener('mousedown', function(e) {
        isDragging = true;
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    });

    renderer.domElement.addEventListener('mousemove', function(e) {
        if (isDragging) {
            let deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };

            scene.position.x += deltaMove.x;
            scene.position.y -= deltaMove.y;
            logScenePositionRelativeToCanvas();

            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        }
    });

    renderer.domElement.addEventListener('mouseup', function() {
        isDragging = false;
    });

    renderer.domElement.addEventListener('touchstart', function(e) {
        isDragging = true;
        previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    });

    renderer.domElement.addEventListener('touchmove', function(e) {
        e.preventDefault();
        let touch1 = e.touches[0];
        let touch2 = e.touches[1];

        if (touch1 && touch2) {
            let p1 = { x: touch1.clientX, y: touch1.clientY };
            let p2 = { x: touch2.clientX, y: touch2.clientY };

            if (!lastCenter) {
                lastCenter = getCenter(p1, p2);
                return;
            }
            let newCenter = getCenter(p1, p2);
            let dist = getDistance(p1, p2);

            if (!lastDist) {
                lastDist = dist;
            }

            let pointTo = {
                x: (newCenter.x - scene.position.x) / scene.scale.x,
                y: (newCenter.y - scene.position.y) / scene.scale.y
            };
            let scale = scene.scale.x * (dist / lastDist);

            scene.scale.set(scale, scale, 1);

            let dx = newCenter.x - lastCenter.x;
            let dy = newCenter.y - lastCenter.y;

            let newPos = {
                x: newCenter.x - pointTo.x * scale + dx,
                y: newCenter.y - pointTo.y * scale + dy
            };

            scene.position.set(newPos.x, newPos.y, mesh.position.z);
            logScenePositionRelativeToCanvas();

            lastDist = dist;
            lastCenter = newCenter;
        } else {
            if (isDragging) {
                let deltaMove = {
                    x: e.touches[0].clientX - previousMousePosition.x,
                    y: e.touches[0].clientY - previousMousePosition.y
                };
    
                scene.position.x += deltaMove.x;
                scene.position.y -= deltaMove.y;
    
                previousMousePosition = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
            }
            console.log('one finger: ', e.touches[0].clientX, e.touches[0].clientY)
        }
    });

    renderer.domElement.addEventListener('touchend', function() {
        lastDist = 0;
        lastCenter = null;
        isDragging = false;
    });

    function logScenePositionRelativeToCanvas() {
        const canvasSize = new THREE.Vector2();
        renderer.getSize(canvasSize); // Get the size of the canvas
    
        // Calculate the center of the canvas in WebGL coordinates (-1 to 1 for x and y)
        const canvasCenter = {
            x: (canvasSize.x / window.innerWidth) * 2 - 1,
            y: -(canvasSize.y / window.innerHeight) * 2 + 1
        };
    
        // Calculate the offset of the scene from the center of the canvas
        // This assumes the scene's position is already in the same coordinate system
        const sceneOffset = {
            x: (scene.position.x - canvasCenter.x) / scene.scale.x,
            y: (scene.position.y - canvasCenter.y) / scene.scale.y
        };
    
        console.log('Scene position relative to canvas:', sceneOffset);
    }

    renderer.domElement.addEventListener('wheel', function(e) {
        e.preventDefault();

        const oldScale = scene.scale.x;
        console.log('wheel event client:', e.clientX, e.clientY)
        console.log('wheel event scene:', scene.position.x, scene.position.y)
        logScenePositionRelativeToCanvas()

        const pointer = {
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: -(e.clientY / window.innerHeight) * 2 + 1
        };
       

        const mousePointTo = {
            x: (pointer.x - scene.position.x) / oldScale,
            y: (pointer.y - scene.position.y) / oldScale
        };

        const direction = e.deltaY > 0 ? -1 : 1;
        const zoomPercent = 0.05 * direction;
        const newScale = oldScale + oldScale * zoomPercent;

        scene.scale.set(newScale, newScale, 1);

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale
        };

        scene.position.set(newPos.x, newPos.y, scene.position.z);
    });

    function generatePolygons(n) {
        for (let i = 0; i < n; i++) {
            let numPoints = 6;
            let points = [];
            for (let j = 0; j < numPoints; j++) { // Fixed variable shadowing by replacing i with j
                let x = (Math.random() * 7000) - 3500;
                let y = (Math.random() * 4000) - 2000;
                points.push(new THREE.Vector2(x, y));
            }
    
            // Create a shape from the points
            let polygonShape = new THREE.Shape(points);
            
            let polygonGeometry = new THREE.ShapeGeometry(polygonShape);

            // Create a mesh material with wireframe
            let meshMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
            
            // Create a mesh with the polygon geometry and mesh material
            let polygonMesh = new THREE.Mesh(polygonGeometry, meshMaterial);
            polygonMesh.name = 'Polygon_' + i;
            
            // Add the line segments to the scene
            scene.add(polygonMesh);
        }
    }
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('click', (event) => {
        // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children);

        for (let i = 0; i < intersects.length; i++) {
            // Step 3: Determine which polygon was clicked and perform an action
            if (intersects[i].object.name.startsWith('Polygon_')) {
                console.log('Polygon clicked:', intersects[i].object.name);
                // Perform any action here, e.g., change color, display information, etc.
                intersects[i].object.material.color.set(0x00ff00); // Example: Change color to green
                break; // Assuming you want to select the first intersected object
            }
        }
    });
    generatePolygons(3000);

    // // Render loop
    // function animate() {
    //     requestAnimationFrame(animate);
    //     renderer.render(scene, camera);
    // }
    // animate();

    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    // Modify your animate function to update stats
    function animate() {
        stats.begin(); // Start monitoring FPS

        requestAnimationFrame(animate);
        renderer.render(scene, camera);

        stats.end(); // End monitoring FPS
    }
    animate();
});

// Handle window resize
window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.left = window.innerWidth / -2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / -2;
    camera.updateProjectionMatrix();
});
