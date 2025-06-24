// basicFragment.glsl
varying vec2 vUv;
uniform float uTime;
uniform float uTimeline;
uniform int uStartIndex;
uniform int uEndIndex;
uniform sampler2D uImage1;
uniform sampler2D uImage2;
uniform sampler2D uImage3;
uniform sampler2D uImage4;

#define NUM_OCTAVES 5

float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);
	
	float res = mix(
		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}

vec4 sampleColor(int index, vec2 uv){
    if(index == 0){
        return texture2D(uImage1,uv);
    }else if (index == 1){
        return texture2D(uImage2,uv);
    }else if (index == 2){
        return texture2D(uImage3,uv);
    }else if (index == 3){
        return texture2D(uImage4,uv);
    }
    return texture2D(uImage1,uv); // default fallback
}

float fbm(vec2 x) {
	float v = 0.0;
	float a = 0.5;
	vec2 shift = vec2(100);
	// Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
	for (int i = 0; i < NUM_OCTAVES; ++i) {
		v += a * noise(x);
		x = rot * x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}

void main() {
    vec2 uv = vUv;
   
    // Create more pronounced floating effect
    float wave1 = fbm(2.0 * uv + uTime * 0.5);
    float wave2 = fbm(3.0 * uv + uTime * 0.3);
    float wave3 = fbm(1.5 * uv + uTime * 0.7);
    
    // Combine multiple wave frequencies for more organic movement
    float combinedWave = (wave1 + wave2 + wave3) / 3.0;
    
    // Create floating effect by distorting UV coordinates more dramatically
    uv -= 0.5;
    
    // Add wave distortion to both x and y coordinates
    uv.x += combinedWave * 0.1 * sin(uTime * 0.5);
    uv.y += combinedWave * 0.1 * cos(uTime * 0.3);
    
    // Apply timeline-based strength
    float strength = smoothstep(0.1, 1.0, uTimeline) - smoothstep(2.0, 3.0, uTimeline);
    
    // More dramatic distortion for floating effect
    float distort = mix(1.0, 1.5 + strength, combinedWave);
    uv *= distort;
    
    uv += 0.5;
    
    // Clamp UV coordinates to prevent artifacts
    uv = clamp(uv, 0.0, 1.0);
    
    // Sample textures
    vec4 startTexture = sampleColor(uStartIndex, uv);
    vec4 endTexture = sampleColor(uEndIndex, uv);
    float changeTimeline = smoothstep(0.5, 2.0, uTimeline);
    float mixer = smoothstep(changeTimeline, changeTimeline + 0.5, uTimeline);
    vec4 tex = mix(startTexture, endTexture, mixer);

    gl_FragColor = tex;
}
