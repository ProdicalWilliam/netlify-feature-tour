// Controls and movement system for first-person multiplayer game

// Global variables for movement state
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

// Setup keyboard controls
function setupControls(controls, moveForward, moveBackward, moveLeft, moveRight) {
    const onKeyDown = function(event) {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                moveForward = true;
                break;
                
            case 'KeyA':
            case 'ArrowLeft':
                moveLeft = true;
                break;
                
            case 'KeyS':
            case 'ArrowDown':
                moveBackward = true;
                break;
                
            case 'KeyD':
            case 'ArrowRight':
                moveRight = true;
                break;
        }
    };
    
    const onKeyUp = function(event) {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                moveForward = false;
                break;
                
            case 'KeyA':
            case 'ArrowLeft':
                moveLeft = false;
                break;
                
            case 'KeyS':
            case 'ArrowDown':
                moveBackward = false;
                break;
                
            case 'KeyD':
            case 'ArrowRight':
                moveRight = false;
                break;
        }
    };
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    // Return references to the movement state variables
    window.moveForward = moveForward;
    window.moveBackward = moveBackward;
    window.moveLeft = moveLeft;
    window.moveRight = moveRight;
}

// Process movement physics
function processMovement(delta, velocity, direction, controls, moveForward, moveBackward, moveLeft, moveRight) {
    // Movement parameters
    const speed = 5.0;
    const friction = 10.0;
    
    // Apply friction to slow down movement
    velocity.x -= velocity.x * friction * delta;
    velocity.z -= velocity.z * friction * delta;
    
    // Get movement direction based on camera orientation
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // Normalize for consistent movement speed in all directions
    
    // Apply movement based on direction
    if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;
    
    // Apply velocity to position
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
}

// Make functions available globally
window.setupControls = setupControls;
window.processMovement = processMovement;
