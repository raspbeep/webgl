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

            mesh.position.x += deltaMove.x;
            mesh.position.y -= deltaMove.y;

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
                return;
            }
            let newCenter = getCenter(p1, p2);
            let dist = getDistance(p1, p2);

            if (!lastDist) {
                lastDist = dist;
            }

            let pointTo = {
                x: (newCenter.x - mesh.position.x) / mesh.scale.x,
                y: (newCenter.y - mesh.position.y) / mesh.scale.y
            };
            let scale = mesh.scale.x * (dist / lastDist);

            mesh.scale.set(scale, scale, 1);

            let dx = newCenter.x - lastCenter.x;
            let dy = newCenter.y - lastCenter.y;

            let newPos = {
                x: newCenter.x - pointTo.x * scale + dx,
                y: newCenter.y - pointTo.y * scale + dy
            };

            mesh.position.set(newPos.x, newPos.y, mesh.position.z);

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
            mesh.scale.x *= 1.1;
            mesh.scale.y *= 1.1;
        } else {
            mesh.scale.x /= 1.1;
            mesh.scale.y /= 1.1;
        }
    });

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
