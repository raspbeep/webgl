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

            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        }
    });

    renderer.domElement.addEventListener('mouseup', function() {
        isDragging = false;
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
                lastDist = getDistance(p1, p2);
                return;
            }
            
            let newCenter = getCenter(p1, p2);
            let dist = getDistance(p1, p2);
    
            let pointTo = {
                x: (newCenter.x - scene.position.x) / scene.scale.x,
                y: (newCenter.y - scene.position.y) / scene.scale.y
            };
            let scale = scene.scale.x * (dist / lastDist);
    
            scene.scale.set(scale, scale, 1);
    
            let dx = (newCenter.x - lastCenter.x) / scene.scale.x;
            let dy = (newCenter.y - lastCenter.y) / scene.scale.y;
    
            let newPos = {
                x: scene.position.x - dx,
                y: scene.position.y - dy
            };
    
            scene.position.set(newPos.x, newPos.y, mesh.position.z);
    
            lastDist = dist;
            lastCenter = newCenter;
        }
    });

    renderer.domElement.addEventListener('touchend', function() {
        lastDist = 0;
        lastCenter = null;
    });

    renderer.domElement.addEventListener('wheel', function(e) {
        e.preventDefault();
        if (e.deltaY < 0) {
            scene.scale.x *= 1.1;
            scene.scale.y *= 1.1;
        } else {
            scene.scale.x /= 1.1;
            scene.scale.y /= 1.1;
        }
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

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
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
