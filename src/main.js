import './style.css';
import * as THREE from 'three';
import vertex from '../shaders/vertex.glsl';
import fragment from '../shaders/fragments.glsl';
import gsap from 'gsap';

// HTML injection
// (Place this before initializing Three.js)
document.querySelector('#app').innerHTML = `
  <div class="w-full h-screen bg-zinc-900 relative">
    <div class="w-full canvas flex text-white h-screen relative z-0">
      <div class="w-1/2 h-screen flex items-center justify-center"></div>
      <a class="text-2xl opacity-60 font-base fixed top-10 flex right-10 z-20" href=""> Close Menu <img src="/images/cross.jpg" height="10" width="15" alt=""></a>
      <div class="links mt-[10%] ml-[10%] flex flex-col gap-10 z-20 relative">
        <a class="lowercase transition-all hover:ml-5 opacity-30 hover:opacity-100 block tracking-tighter text-6xl" href="">
          <small class="text-xl tracking-normal">01.</small>
          Bello spetilo
        </a>
        <a class="lowercase transition-all hover:ml-5 opacity-30 hover:opacity-100 block tracking-tighter text-6xl" href="">
          <small class="text-xl tracking-normal">02.</small>
          Bello spetilo
        </a>
        <a class="lowercase transition-all hover:ml-5 opacity-30 hover:opacity-100 block tracking-tighter text-6xl" href="">
          <small class="text-xl tracking-normal">03.</small>
          Bellopetilo
        </a>
        <a class="lowercase transition-all hover:ml-5 opacity-30 hover:opacity-100 block tracking-tighter text-6xl" href="">
          <small class="text-xl tracking-normal">04.</small>
          Betilo
        </a>
        <a class="lowercase transition-all hover:ml-5 opacity-30 hover:opacity-100 block tracking-tighter text-6xl" href="">
          <small class="text-xl tracking-normal">05.</small>
          Magnifico
        </a>
      </div>
      <div class="images w-[25vw] h-[32vw] absolute top-0 left-0 ml-[5vw] mt-[5vw] z-20">
        <img class="absolute w-full h-full object-cover" src="/images/first.jpg" alt="">
      </div>
    </div>
  </div>
`;

// Three.js logic
class Site {
  constructor({ dom }) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.container = dom;
    this.images = [...document.querySelectorAll('.images img')];
    this.materials;
    this.imageStore = [];
    this.uStartIndex = 0;
    this.uEndIndex = 1;
    this.time = 0; // Initialize time for animation

    // Only use the first image
    this.img = document.querySelector('.images img');
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 100, 2000);
    this.camera.position.z = 500;
    this.camera.fov= 2* Math.atan(this.height/2/200)*(180/Math.PI);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height);
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.zIndex = '0';
    this.container.appendChild(this.renderer.domElement);

    this.addImageMesh();
    this.render();
    this.hoverOverLinks();

    window.addEventListener('resize', () => this.resize());
  }

  addImageMesh() {
    if (!this.img) return;
    const textureLoader = new THREE.TextureLoader();
    
    // Load all images
    const imageUrls = [
      '/images/first.jpg',
      '/images/second.jpg', 
      '/images/third.jpg',
      '/images/fourth.jpg'
      
    ];
    
    // Load all textures
    this.imageStore = imageUrls.map(url => textureLoader.load(url));

    // Set your desired image size here
    const IMAGE_WIDTH = 500;
    const IMAGE_HEIGHT = 550;

    const uniforms = {
      uTime: { value: 0 },
      uTimeline: { value: 0.2 },
      uStartIndex: { value: 0 },
      uEndIndex: { value: 1 },
      uImage1: { value: this.imageStore[0] },
      uImage2: { value: this.imageStore[1] },
      uImage3: { value: this.imageStore[2] },
      uImage4: { value: this.imageStore[3] },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: uniforms,
      transparent: true,
    });
    const geometry = new THREE.PlaneGeometry(IMAGE_WIDTH, IMAGE_HEIGHT);
    this.mesh = new THREE.Mesh(geometry, material);

    // Position at top left with margin
    const offsetX = 100; // px from left
    const offsetY = 100; // px from top
    this.mesh.position.x = -this.width / 2 + offsetX + IMAGE_WIDTH / 2;
    this.mesh.position.y = this.height / 2 - offsetY - IMAGE_HEIGHT / 2;
    this.mesh.position.z = 0;

    this.scene.add(this.mesh);
  }
  hoverOverLinks(){
    const links= document.querySelectorAll('.links a');
    links.forEach((link, i)=>{
      link.addEventListener('mouseover', (e)=>{
        // Reset timeline to start transition
        this.mesh.material.uniforms.uTimeline.value = 0.0;
        
        // Update indices for the transition
        this.uStartIndex = this.uEndIndex; // Current image becomes start
        this.uEndIndex = i; // New image becomes end
        
        // Update uniform values
        this.mesh.material.uniforms.uStartIndex.value = this.uStartIndex;
        this.mesh.material.uniforms.uEndIndex.value = this.uEndIndex;
        
        // Animate the timeline
        gsap.to(this.mesh.material.uniforms.uTimeline, {
          value: 4.0,
          duration: 1.0,
          ease: 'power2.inOut'
        });
      });
    });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);

    // Reposition mesh
    if (this.mesh) {
      const IMAGE_WIDTH = 200;
      const IMAGE_HEIGHT = 200;
      const offsetX = 100;
      const offsetY = 100;
      this.mesh.position.x = -this.width / 2 + offsetX + IMAGE_WIDTH / 2;
      this.mesh.position.y = this.height / 2 - offsetY - IMAGE_HEIGHT / 2;
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.time += 0.03; // Increment time for animation
    if (this.mesh && this.mesh.material) {
      this.mesh.material.uniforms.uTime.value = this.time;
    }
    requestAnimationFrame(this.render.bind(this));
  }
}

// Initialize Three.js after DOM is updated
new Site({
  dom: document.querySelector('.canvas'),
});