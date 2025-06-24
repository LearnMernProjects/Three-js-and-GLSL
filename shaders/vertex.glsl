// basicVertex.glsl
varying vec2 vUv;
uniform float uTime;

void main() {
    vUv = uv;
    
    // Create floating effect by modifying vertex positions
    vec3 pos = position;
    
    // Add more pronounced floating motion to the entire mesh
    float floatX = sin(uTime * 0.8) * 15.0;
    float floatY = cos(uTime * 0.6) * 10.0;
    float floatZ = sin(uTime * 0.4) * 5.0;
    
    // Apply floating motion to vertex positions
    pos.x += floatX;
    pos.y += floatY;
    pos.z += floatZ;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
