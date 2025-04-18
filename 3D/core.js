class GameCore {
    constructor(container, playerId, playersRef) {
        this.playerId = playerId;
        this.playersRef = playersRef;
        this.otherPlayers = {};
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.7, 0);
        
        // Renderer setup with shadows
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        container.appendChild(this.renderer.domElement);
        
        // Controls for first person
        this.controls = new THREE.PointerLockControls(this.camera, document.body);
        this.scene.add(this.controls.getObject());
        
        // Physics variables
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.clock = new THREE.Clock();
        
        // Player object
        this.player = new THREE.Object3D();
        this.scene.add(this.player);
        this.playerModel = null;
        
        // Firebase update throttling
        this.lastUpdate = 0;
        
        // Set up lighting, environment and scene
        this.setupLighting();
        this.loadEnvironmentMap();
        
        // Listen for other players
        this.setupMultiplayer();
        
        // Clean up inactive players periodically
        setInterval(() => this.cleanupInactivePlayers(), 30000);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffaa, 1.0);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        
        // Additional hemisphere light
        const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
        this.scene.add(hemiLight);
    }
    
    loadEnvironmentMap() {
        const rgbeLoader = new THREE.RGBELoader();
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();
        
        rgbeLoader.setDataType(THREE.UnsignedByteType)
            .load('https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr', (texture) => {
                this.envMap = pmremGenerator.fromEquirectangular(texture).texture;
                this.scene.environment = this.envMap;
                
                texture.dispose();
                pmremGenerator.dispose();
                
                this.setupMaterials();
                this.loadPlayerModel();
            });
    }
    
    setupMaterials() {
        // Ground material with reflection
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x556b2f,
            roughness: 0.7,
            metalness: 0.1,
            envMap: this.envMap,
            side: THREE.DoubleSide
        });
        
        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(40, 40, 32, 32);
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Wall material
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            roughness: 0.6,
            metalness: 0.2,
            envMap: this.envMap
        });
        
        // Load texture for walls
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            'wall.png',
            (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(2, 1);
                wallMaterial.map = texture;
                
                textureLoader.load(
                    'wall_normal.png', 
                    (normalMap) => {
                        wallMaterial.normalMap = normalMap;
                        wallMaterial.normalScale.set(1, 1);
                        wallMaterial.needsUpdate = true;
                    },
                    undefined,
                    () => console.log("Normal map not found")
                );
                
                wallMaterial.needsUpdate = true;
                this.createWalls(wallMaterial);
            },
            undefined,
            () => {
                this.createWalls(wallMaterial);
            }
        );
    }
    
    createWalls(wallMaterial) {
        this.createWall(0, -20, 0, wallMaterial);
        this.createWall(0, 20, 0, wallMaterial);
        this.createWall(-20, 0, Math.PI / 2, wallMaterial);
        this.createWall(20, 0, Math.PI / 2, wallMaterial);
    }
    
    createWall(x, z, rotateY, material) {
        const wallGeometry = new THREE.BoxGeometry(40, 5, 0.5);
        const wall = new THREE.Mesh(wallGeometry, material);
        wall.position.set(x, 2.5, z);
        wall.rotation.y = rotateY;
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.scene.add(wall);
        return wall;
    }
    
    loadPlayerModel() {
        const gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load(
            'models/character_sktail2a.glb',
            (gltf) => {
                this.playerModel = gltf.scene;
                this.playerModel.scale.set(0.5, 0.5, 0.5);
                
                this.playerModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        if (child.material) {
                            child.material.envMap = this.envMap;
                            child.material.needsUpdate = true;
                        }
                    }
                });
                
                // Refresh existing other players with the new model
                for (const id in this.otherPlayers) {
                    this.updateOtherPlayerModel(id);
                }
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading model:', error);
            }
        );
    }
    
    processMovement(delta, moveForward, moveBackward, moveLeft, moveRight) {
        const speed = 5.0;
        const friction = 10.0;
        
        this.velocity.x -= this.velocity.x * friction * delta;
        this.velocity.z -= this.velocity.z * friction * delta;
        
        this.direction.z = Number(moveForward) - Number(moveBackward);
        this.direction.x = Number(moveRight) - Number(moveLeft);
        this.direction.normalize();
        
        if (moveForward || moveBackward) this.velocity.z -= this.direction.z * speed * delta;
        if (moveLeft || moveRight) this.velocity.x -= this.direction.x * speed * delta;
        
        this.controls.moveRight(-this.velocity.x * delta);
        this.controls.moveForward(-this.velocity.z * delta);
        
        // Simple collision detection with boundaries
        const playerPos = this.controls.getObject().position;
        if (playerPos.x > 19.5) playerPos.x = 19.5;
        if (playerPos.x < -19.5) playerPos.x = -19.5;
        if (playerPos.z > 19.5) playerPos.z = 19.5;
        if (playerPos.z < -19.5) playerPos.z = -19.5;
        
        // Keep y position stable (no jumping/falling)
        if (playerPos.y !== 1.7) playerPos.y = 1.7;
        
        // Update position in Firebase
        this.updatePlayerPositionInFirebase();
    }
    
    updatePlayerPositionInFirebase() {
        const now = Date.now();
        // Update at most every 50ms for smoother remote player movements
        if (now - this.lastUpdate > 50) {
            this.lastUpdate = now;
            
            const position = this.controls.getObject().position;
            const rotation = new THREE.Euler().setFromQuaternion(this.camera.quaternion);
            
            this.playersRef.child(this.playerId).set({
                position: {
                    x: position.x,
                    y: position.y,
                    z: position.z
                },
                rotation: {
                    y: rotation.y
                },
                lastUpdated: firebase.database.ServerValue.TIMESTAMP
            });
        }
    }
    
    updateOtherPlayerModel(id) {
        if (!this.otherPlayers[id] || !this.playerModel) return;
        
        // Remove old mesh
        while(this.otherPlayers[id].children.length > 0) {
            this.otherPlayers[id].remove(this.otherPlayers[id].children[0]);
        }
        
        // Add new model as a child
        const newModel = this.playerModel.clone();
        this.otherPlayers[id].add(newModel);
    }
    
    setupMultiplayer() {
        // Listen for other players' updates
        this.playersRef.on('value', (snapshot) => {
            const players = snapshot.val() || {};
            
            // Add or update other players
            for (const id in players) {
                if (id !== this.playerId) {
                    this.createOrUpdateOtherPlayer(id, players[id]);
                }
            }
            
            // Remove disconnected players
            for (const id in this.otherPlayers) {
                if (!players[id]) {
                    this.scene.remove(this.otherPlayers[id]);
                    delete this.otherPlayers[id];
                }
            }
        });
    }
    
    createOrUpdateOtherPlayer(id, data) {
        if (id === this.playerId) return;
        
        if (!this.otherPlayers[id]) {
            // Create a new object for this player
            const otherPlayer = new THREE.Object3D();
            this.scene.add(otherPlayer);
            this.otherPlayers[id] = otherPlayer;
            
            // If we have the player model loaded, use it
            if (this.playerModel) {
                const newModel = this.playerModel.clone();
                otherPlayer.add(newModel);
            } else {
                // Fallback to a colored capsule until model loads
                const capsuleGeom = new THREE.CapsuleGeometry(0.3, 1.0, 4, 8);
                const capsuleMat = new THREE.MeshStandardMaterial({ 
                    color: 0x0088ff,
                    roughness: 0.7,
                    metalness: 0.3
                });
                const capsule = new THREE.Mesh(capsuleGeom, capsuleMat);
                capsule.castShadow = true;
                capsule.position.y = 0.85;
                otherPlayer.add(capsule);
            }
        }
        
        // Get the current position/rotation
        const otherPlayer = this.otherPlayers[id];
        const currentPos = otherPlayer.position.clone();
        const targetPos = new THREE.Vector3(
            data.position.x,
            data.position.y,
            data.position.z
        );
        
        // Store target position for interpolation
        otherPlayer.userData.targetPosition = targetPos;
        otherPlayer.userData.startPosition = currentPos;
        otherPlayer.userData.interpolationStart = Date.now();
        
        // Also store rotation
        if (data.rotation) {
            otherPlayer.userData.targetRotation = data.rotation.y;
        }
    }
    
    updateOtherPlayers() {
        for (const id in this.otherPlayers) {
            const otherPlayer = this.otherPlayers[id];
            
            if (otherPlayer.userData.targetPosition && otherPlayer.userData.startPosition) {
                const now = Date.now();
                const interpolationDuration = 100;
                const elapsed = now - otherPlayer.userData.interpolationStart;
                const progress = Math.min(elapsed / interpolationDuration, 1);
                
                // Lerp position for smooth movement
                otherPlayer.position.lerpVectors(
                    otherPlayer.userData.startPosition,
                    otherPlayer.userData.targetPosition,
                    progress
                );
                
                // Smoothly rotate to target rotation
                if (otherPlayer.userData.targetRotation !== undefined) {
                    otherPlayer.rotation.y = THREE.MathUtils.lerp(
                        otherPlayer.rotation.y || 0,
                        otherPlayer.userData.targetRotation,
                        progress
                    );
                }
            }
        }
    }
    
    cleanupInactivePlayers() {
        const now = Date.now();
        const timeoutDuration = 10000; // 10 seconds
        
        this.playersRef.once('value', (snapshot) => {
            const players = snapshot.val() || {};
            
            for (const id in players) {
                const player = players[id];
                if (player.lastUpdated && now - player.lastUpdated > timeoutDuration) {
                    this.playersRef.child(id).remove();
                }
            }
        });
    }
    
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
