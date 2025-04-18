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
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
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
        this.movementSpeed = 8.0; // Increased speed
        
        this.setupLighting();
        this.loadEnvironmentMap();
        this.setupMultiplayer();
        
        setInterval(() => this.cleanupInactivePlayers(), 30000);
        
        this.fontLoader = new THREE.FontLoader();
        this.textMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
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
                this.loadHandsModel();
            });
    }
    
    setupMaterials() {
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x556b2f,
            roughness: 0.7,
            metalness: 0.1,
            envMap: this.envMap,
            side: THREE.DoubleSide
        });
        
        const groundGeometry = new THREE.PlaneGeometry(40, 40, 32, 32);
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            roughness: 0.6,
            metalness: 0.2,
            envMap: this.envMap
        });
        
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
                this.playerModel.position.y = -1.0; // Raise model so it's not in ground
                
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
    
    loadHandsModel() {
        const gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load(
            'models/hands.glb', // Make sure you have this model file
            (gltf) => {
                this.handsModel = gltf.scene;
                this.handsModel.scale.set(0.2, 0.2, 0.2);
                
                this.handsModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        
                        if (child.material) {
                            child.material.envMap = this.envMap;
                            child.material.needsUpdate = true;
                        }
                    }
                });
                
                this.camera.add(this.handsModel);
                this.handsModel.position.set(0.3, -0.3, -0.5);
            },
            undefined,
            (error) => {
                console.error('Error loading hands model:', error);
            }
        );
    }
    
    processMovement(delta, moveForward, moveBackward, moveLeft, moveRight) {
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
    }
    
    updatePlayerPositionInFirebase() {
        const now = Date.now();
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
                name: localStorage.getItem('playerName') || 'Player',
                lastUpdated: firebase.database.ServerValue.TIMESTAMP
            });
        }
    }
    
    updateOtherPlayerModel(id) {
        if (!this.otherPlayers[id] || !this.playerModel) return;
        
        while(this.otherPlayers[id].children.length > 0) {
            if (this.otherPlayers[id].children[0].isNameTag) continue;
            this.otherPlayers[id].remove(this.otherPlayers[id].children[0]);
        }
        
        const newModel = this.playerModel.clone();
        newModel.position.y = -1.0; // Position adjustment
        this.otherPlayers[id].add(newModel);
    }
    
    createNameTag(id, name) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = '#00000088';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.font = 'Bold 32px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(name || id, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(1.5, 0.4, 1);
        sprite.position.y = 2.2;
        sprite.isNameTag = true;
        
        return sprite;
    }
    
    setupMultiplayer() {
        this.playersRef.on('value', (snapshot) => {
            const players = snapshot.val() || {};
            
            for (const id in players) {
                if (id !== this.playerId) {
                    this.createOrUpdateOtherPlayer(id, players[id]);
                }
            }
            
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
            const otherPlayer = new THREE.Object3D();
            this.scene.add(otherPlayer);
            this.otherPlayers[id] = otherPlayer;
            
            // Add name tag
            const nameTag = this.createNameTag(id, data.name);
            otherPlayer.add(nameTag);
            
            if (this.playerModel) {
                const newModel = this.playerModel.clone();
                newModel.position.y = -1.0; // Position adjustment
                otherPlayer.add(newModel);
            } else {
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
        } else if (data.name && this.otherPlayers[id].getObjectByProperty('isNameTag', true)) {
            // Update name tag if necessary
            const nameTagObj = this.otherPlayers[id].getObjectByProperty('isNameTag', true);
            if (nameTagObj) {
                this.otherPlayers[id].remove(nameTagObj);
            }
            const nameTag = this.createNameTag(id, data.name);
            this.otherPlayers[id].add(nameTag);
        }
        
        const otherPlayer = this.otherPlayers[id];
        const currentPos = otherPlayer.position.clone();
        const targetPos = new THREE.Vector3(
            data.position.x,
            data.position.y,
            data.position.z
        );
        
        otherPlayer.userData.targetPosition = targetPos;
        otherPlayer.userData.startPosition = currentPos;
        otherPlayer.userData.interpolationStart = Date.now();
        
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
    }
    
    cleanupInactivePlayers() {
        const now = Date.now();
        const timeoutDuration = 10000;
        
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
