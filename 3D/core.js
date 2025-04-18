class GameCore {
    constructor(container, playerId, playersRef) {
        this.playerId = playerId;
        this.playersRef = playersRef;
        this.otherPlayers = {};
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.7, 0);
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Check if these properties exist before setting them
        if (this.renderer.outputEncoding !== undefined) {
            this.renderer.outputEncoding = THREE.sRGBEncoding;
        }
        if (this.renderer.toneMapping !== undefined) {
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.0;
        }
        
        container.appendChild(this.renderer.domElement);
        
        this.controls = new THREE.PointerLockControls(this.camera, document.body);
        this.scene.add(this.controls.getObject());
        
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.clock = new THREE.Clock();
        
        this.player = new THREE.Object3D();
        this.scene.add(this.player);
        this.playerModel = null;
        this.handsModel = null;
        
        this.lastUpdate = 0;
        this.movementSpeed = 8.0;
        this.modelsLoaded = false;
        
        this.setupLighting();
        this.loadEnvironmentMap();
        
        // Delay multiplayer setup to avoid overwhelming the initial load
        setTimeout(() => {
            this.setupMultiplayer();
        }, 1000);
        
        // Reduce frequency of cleanup
        setInterval(() => this.cleanupInactivePlayers(), 60000);
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffaa, 1.0);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        
        // Lower resolution shadow maps for better performance
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        
        const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
        this.scene.add(hemiLight);
    }
    
    loadEnvironmentMap() {
        try {
            // Check if RGBELoader is available
            if (typeof THREE.RGBELoader === 'undefined') {
                console.warn("RGBELoader not available, skipping environment map");
                this.setupMaterials();
                this.loadPlayerModel();
                return;
            }
            
            const rgbeLoader = new THREE.RGBELoader();
            
            // Check if PMREMGenerator is available
            if (typeof THREE.PMREMGenerator === 'undefined') {
                console.warn("PMREMGenerator not available, skipping environment map");
                this.setupMaterials();
                this.loadPlayerModel();
                return;
            }
            
            const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
            
            // Check if compileEquirectangularShader method exists
            if (typeof pmremGenerator.compileEquirectangularShader === 'function') {
                pmremGenerator.compileEquirectangularShader();
            }
            
            rgbeLoader.setDataType(THREE.UnsignedByteType)
                .load('https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr', 
                    (texture) => {
                        this.envMap = pmremGenerator.fromEquirectangular(texture).texture;
                        this.scene.environment = this.envMap;
                        
                        texture.dispose();
                        pmremGenerator.dispose();
                        
                        this.setupMaterials();
                        this.loadPlayerModel();
                        
                        // Try loading hands model after player model
                        setTimeout(() => {
                            this.loadHandsModel();
                        }, 500);
                    },
                    undefined,
                    (error) => {
                        console.error("Error loading HDR texture:", error);
                        this.setupMaterials();
                        this.loadPlayerModel();
                    }
                );
        } catch (e) {
            console.error("Error in loadEnvironmentMap:", e);
            this.setupMaterials();
            this.loadPlayerModel();
        }
    }
    
    setupMaterials() {
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x556b2f,
            roughness: 0.7,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        
        if (this.envMap) {
            groundMaterial.envMap = this.envMap;
        }
        
        const groundGeometry = new THREE.PlaneGeometry(40, 40, 8, 8); // Reduced segments
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Create walls with simpler textures for performance
        this.createWalls();
    }
    
    createWalls() {
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            roughness: 0.6,
            metalness: 0.2
        });
        
        if (this.envMap) {
            wallMaterial.envMap = this.envMap;
        }
        
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
        try {
            // Check if GLTFLoader is available
            if (typeof THREE.GLTFLoader === 'undefined') {
                console.warn("GLTFLoader not available, using fallback model");
                this.createFallbackPlayerModel();
                return;
            }
            
            const gltfLoader = new THREE.GLTFLoader();
            gltfLoader.load(
                'models/character_sktail2a.glb',
                (gltf) => {
                    try {
                        this.playerModel = gltf.scene;
                        this.playerModel.scale.set(0.5, 0.5, 0.5);
                        this.playerModel.position.y = -1.0;
                        
                        this.playerModel.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                                
                                // Optimize materials
                                if (child.material) {
                                    child.material.side = THREE.FrontSide; // Performance improvement
                                    if (this.envMap) {
                                        child.material.envMap = this.envMap;
                                    }
                                    child.material.needsUpdate = true;
                                }
                            }
                        });
                        
                        this.modelsLoaded = true;
                        
                        // Only update player models after they've been successfully loaded
                        for (const id in this.otherPlayers) {
                            this.updateOtherPlayerModel(id);
                        }
                    } catch (e) {
                        console.error("Error processing player model:", e);
                        this.createFallbackPlayerModel();
                    }
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                (error) => {
                    console.error('Error loading model:', error);
                    this.createFallbackPlayerModel();
                }
            );
        } catch (e) {
            console.error("Error in loadPlayerModel:", e);
            this.createFallbackPlayerModel();
        }
    }
    
    createFallbackPlayerModel() {
        const geometry = new THREE.CapsuleGeometry(0.3, 1.0, 4, 8);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x0088ff,
            roughness: 0.7,
            metalness: 0.3
        });
        
        this.playerModel = new THREE.Object3D();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.85;
        mesh.castShadow = true;
        this.playerModel.add(mesh);
        
        this.modelsLoaded = true;
    }
    
    loadHandsModel() {
        try {
            // Skip if GLTFLoader isn't available
            if (typeof THREE.GLTFLoader === 'undefined') {
                console.warn("GLTFLoader not available, skipping hands model");
                return;
            }
            
            const gltfLoader = new THREE.GLTFLoader();
            
            // First check if the hands model exists
            fetch('models/hands.glb')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Hands model not found');
                    }
                    
                    gltfLoader.load(
                        'models/hands.glb',
                        (gltf) => {
                            try {
                                this.handsModel = gltf.scene;
                                this.handsModel.scale.set(0.2, 0.2, 0.2);
                                
                                this.handsModel.traverse((child) => {
                                    if (child.isMesh) {
                                        child.castShadow = true;
                                        
                                        if (child.material) {
                                            if (this.envMap) {
                                                child.material.envMap = this.envMap;
                                            }
                                            child.material.needsUpdate = true;
                                        }
                                    }
                                });
                                
                                this.camera.add(this.handsModel);
                                this.handsModel.position.set(0.3, -0.3, -0.5);
                            } catch (e) {
                                console.error("Error processing hands model:", e);
                            }
                        },
                        undefined,
                        (error) => {
                            console.error('Error loading hands model:', error);
                        }
                    );
                })
                .catch(error => {
                    console.warn("Hands model not found:", error);
                    this.createSimpleHands();
                });
        } catch (e) {
            console.error("Error in loadHandsModel:", e);
            this.createSimpleHands();
        }
    }
    
    createSimpleHands() {
        // Create a simple hand representation
        const handGeometry = new THREE.BoxGeometry(0.08, 0.15, 0.3);
        const handMaterial = new THREE.MeshStandardMaterial({ color: 0xffcca8 });
        
        this.handsModel = new THREE.Object3D();
        
        // Right hand
        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(0.3, -0.3, -0.5);
        rightHand.rotation.x = 0.2;
        this.handsModel.add(rightHand);
        
        // Left hand
        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-0.3, -0.3, -0.5);
        leftHand.rotation.x = 0.2;
        this.handsModel.add(leftHand);
        
        this.camera.add(this.handsModel);
    }
    
    processMovement(delta, moveForward, moveBackward, moveLeft, moveRight) {
        try {
            const speed = this.movementSpeed;
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
            
            const playerPos = this.controls.getObject().position;
            if (playerPos.x > 19.5) playerPos.x = 19.5;
            if (playerPos.x < -19.5) playerPos.x = -19.5;
            if (playerPos.z > 19.5) playerPos.z = 19.5;
            if (playerPos.z < -19.5) playerPos.z = -19.5;
            
            if (playerPos.y !== 1.7) playerPos.y = 1.7;
            
            this.updatePlayerPositionInFirebase();
        } catch (e) {
            console.error("Error in processMovement:", e);
        }
    }
    
    updatePlayerPositionInFirebase() {
        try {
            const now = Date.now();
            if (now - this.lastUpdate > 100) { // Reduced update frequency
                this.lastUpdate = now;
                
                const position = this.controls.getObject().position;
                const rotation = new THREE.Euler().setFromQuaternion(this.camera.quaternion);
                
                const playerName = localStorage.getItem('playerName') || 'Player';
                
                this.playersRef.child(this.playerId).set({
                    position: {
                        x: position.x,
                        y: position.y,
                        z: position.z
                    },
                    rotation: {
                        y: rotation.y
                    },
                    name: playerName,
                    lastUpdated: firebase.database.ServerValue.TIMESTAMP
                });
            }
        } catch (e) {
            console.error("Error updating position in Firebase:", e);
        }
    }
    
    updateOtherPlayerModel(id) {
        try {
            if (!this.otherPlayers[id] || !this.playerModel || !this.modelsLoaded) return;
            
            // Find name tag to preserve
            let nameTag = null;
            this.otherPlayers[id].traverse((child) => {
                if (child.isNameTag) {
                    nameTag = child;
                }
            });
            
            // Clear existing children except nametag
            while(this.otherPlayers[id].children.length > 0) {
                const child = this.otherPlayers[id].children[0];
                if (child.isNameTag) {
                    this.otherPlayers[id].remove(this.otherPlayers[id].children[0]);
                    continue;
                }
                this.otherPlayers[id].remove(child);
            }
            
            // Add the player model
            const newModel = this.playerModel.clone();
            newModel.position.y = -1.0;
            this.otherPlayers[id].add(newModel);
            
            // Re-add the name tag if it existed
            if (nameTag) {
                this.otherPlayers[id].add(nameTag);
            }
        } catch (e) {
            console.error("Error updating other player model:", e, id);
        }
    }
    
    createNameTag(id, name) {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 128; // Reduced for performance
            canvas.height = 32;
            
            context.fillStyle = '#00000088';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            context.font = 'Bold 16px Arial';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(name || id, canvas.width / 2, canvas.height / 2);
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter; // Better performance
            
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(1.2, 0.3, 1);
            sprite.position.y = 2.2;
            sprite.isNameTag = true;
            
            return sprite;
        } catch (e) {
            console.error("Error creating name tag:", e);
            return null;
        }
    }
    
    setupMultiplayer() {
        try {
            let processingUpdate = false;
            
            this.playersRef.on('value', (snapshot) => {
                if (processingUpdate) return;
                processingUpdate = true;
                
                try {
                    const players = snapshot.val() || {};
                    
                    // Process a limited number of player updates per frame for performance
                    const maxPlayersToProcess = 5;
                    let processedCount = 0;
                    
                    for (const id in players) {
                        if (id !== this.playerId) {
                            if (processedCount < maxPlayersToProcess) {
                                this.createOrUpdateOtherPlayer(id, players[id]);
                                processedCount++;
                            }
                        }
                    }
                    
                    // Remove disconnected players
                    for (const id in this.otherPlayers) {
                        if (!players[id]) {
                            this.scene.remove(this.otherPlayers[id]);
                            delete this.otherPlayers[id];
                        }
                    }
                } catch (e) {
                    console.error("Error processing player updates:", e);
                }
                
                processingUpdate = false;
            });
        } catch (e) {
            console.error("Error setting up multiplayer:", e);
        }
    }
    
    createOrUpdateOtherPlayer(id, data) {
        try {
            if (id === this.playerId) return;
            
            if (!this.otherPlayers[id]) {
                const otherPlayer = new THREE.Object3D();
                this.scene.add(otherPlayer);
                this.otherPlayers[id] = otherPlayer;
                
                // Add name tag if we have a name
                if (data.name) {
                    const nameTag = this.createNameTag(id, data.name);
                    if (nameTag) {
                        otherPlayer.add(nameTag);
                    }
                }
                
                // Add model if available
                if (this.playerModel && this.modelsLoaded) {
                    const newModel = this.playerModel.clone();
                    newModel.position.y = -1.0;
                    otherPlayer.add(newModel);
                } else {
                    // Simple fallback model
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
            } else if (data.name) {
                // Check if we need to update name tag
                let nameTagExists = false;
                this.otherPlayers[id].traverse((child) => {
                    if (child.isNameTag) {
                        nameTagExists = true;
                    }
                });
                
                if (!nameTagExists) {
                    const nameTag = this.createNameTag(id, data.name);
                    if (nameTag) {
                        this.otherPlayers[id].add(nameTag);
                    }
                }
            }
            
            const otherPlayer = this.otherPlayers[id];
            const currentPos = otherPlayer.position.clone();
            const targetPos = new THREE.Vector3(
                data.position.x,
                data.position.y,
                data.position.z
            );
            
            // Store data for interpolation
            otherPlayer.userData.targetPosition = targetPos;
            otherPlayer.userData.startPosition = currentPos;
            otherPlayer.userData.interpolationStart = Date.now();
            
            if (data.rotation) {
                otherPlayer.userData.targetRotation = data.rotation.y;
            }
        } catch (e) {
            console.error("Error creating/updating other player:", e, id);
        }
    }
    
    updateOtherPlayers() {
        try {
            for (const id in this.otherPlayers) {
                const otherPlayer = this.otherPlayers[id];
                
                if (otherPlayer.userData.targetPosition && otherPlayer.userData.startPosition) {
                    const now = Date.now();
                    const interpolationDuration = 100;
                    const elapsed = now - otherPlayer.userData.interpolationStart;
                    const progress = Math.min(elapsed / interpolationDuration, 1);
                    
                    otherPlayer.position.lerpVectors(
                        otherPlayer.userData.startPosition,
                        otherPlayer.userData.targetPosition,
                        progress
                    );
                    
                    if (otherPlayer.userData.targetRotation !== undefined) {
                        otherPlayer.rotation.y = THREE.MathUtils.lerp(
                            otherPlayer.rotation.y || 0,
                            otherPlayer.userData.targetRotation,
                            progress
                        );
                    }
                }
            }
        } catch (e) {
            console.error("Error updating other players:", e);
        }
    }
    
    cleanupInactivePlayers() {
        try {
            const now = Date.now();
            const timeoutDuration = 10000;
            
            this.playersRef.once('value', (snapshot) => {
                try {
                    const players = snapshot.val() || {};
                    
                    for (const id in players) {
                        const player = players[id];
                        if (player.lastUpdated && now - player.lastUpdated > timeoutDuration) {
                            this.playersRef.child(id).remove();
                        }
                    }
                } catch (e) {
                    console.error("Error processing inactive players:", e);
                }
            });
        } catch (e) {
            console.error("Error cleaning up inactive players:", e);
        }
    }
    
    handleResize() {
        try {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        } catch (e) {
            console.error("Error handling resize:", e);
        }
    }
}
