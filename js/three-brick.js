/* =============================================
   BRICK — Three.js 3D Brick Scene
   ============================================= */

const THREE_BRICK = (() => {
  let scene, camera, renderer, brick, brickGroup;
  let mouseX = 0, mouseY = 0;
  let targetRotX = 0, targetRotY = 0;
  let isAutoRotate = true;
  let animationId = null;

  // Quality settings
  const quality = {
    segments: 32,
    shadows: true,
    antialias: true,
  };

  function init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 5);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: quality.antialias,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = quality.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Lights
    setupLights();

    // Brick
    createBrick();

    // Floor shadow
    createFloor();

    // Particles background
    createParticles();

    // Mouse events
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('touchmove', onTouchMove, { passive: true });

    // Resize
    const resizeObserver = new ResizeObserver(() => onResize(containerId));
    resizeObserver.observe(container);

    animate();
  }

  function setupLights() {
    // Ambient
    const ambient = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambient);

    // Key light (warm)
    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    keyLight.position.set(2, 3, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 10;
    scene.add(keyLight);

    // Fill light (cool)
    const fillLight = new THREE.DirectionalLight(0x4466ff, 0.5);
    fillLight.position.set(-2, 1, -3);
    scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xff8866, 0.8);
    rimLight.position.set(-1, 2, -2);
    scene.add(rimLight);

    // Point light for dramatic effect
    const pointLight = new THREE.PointLight(0xff4400, 0.3, 8);
    pointLight.position.set(0, 1, 2);
    scene.add(pointLight);
  }

  function createBrick() {
    brickGroup = new THREE.Group();

    // Main brick body
    const geo = new THREE.BoxGeometry(1.6, 0.8, 0.8, quality.segments, quality.segments, quality.segments);

    // Add subtle surface deformation for realism
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      // Slight noise for imperfect surface
      const noise = (Math.random() - 0.5) * 0.015;
      pos.setXYZ(i, x, y + noise * 2, z + noise);
    }
    geo.computeVertexNormals();

    // Main material
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x8B4513,
      roughness: 0.85,
      metalness: 0.02,
      clearcoat: 0.05,
      clearcoatRoughness: 0.8,
      reflectivity: 0.1,
      envMapIntensity: 0.3,
    });

    brick = new THREE.Mesh(geo, mat);
    brick.castShadow = true;
    brick.receiveShadow = true;
    brick.position.y = -0.2;
    brickGroup.add(brick);

    // Surface details - small bumps/dots
    const detailMat = new THREE.MeshPhysicalMaterial({
      color: 0x7A3B10,
      roughness: 0.9,
      metalness: 0.0,
    });

    // Add subtle edge highlights
    const edgeGeo = new THREE.EdgesGeometry(geo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x5D3A1A,
      transparent: true,
      opacity: 0.3,
    });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    brick.add(edges);

    scene.add(brickGroup);

    // Add a subtle glow
    const glowGeo = new THREE.BoxGeometry(1.7, 0.9, 0.9);
    const glowMat = new THREE.MeshPhysicalMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.03,
      emissive: 0xff2200,
      emissiveIntensity: 0.1,
      roughness: 0.5,
      metalness: 0.0,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = -0.2;
    brickGroup.add(glow);
  }

  function createFloor() {
    const geo = new THREE.PlaneGeometry(6, 4);
    const mat = new THREE.ShadowMaterial({
      opacity: 0.4,
    });
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.65;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  function createParticles() {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
      sizes[i] = Math.random() * 0.02 + 0.01;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xD4A843,
      size: 0.03,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);
  }

  function onMouseMove(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    isAutoRotate = false;
    // Reset auto-rotate after idle
    clearTimeout(window._rotateTimeout);
    window._rotateTimeout = setTimeout(() => {
      isAutoRotate = true;
    }, 3000);
  }

  function onTouchMove(e) {
    if (e.touches.length === 0) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    isAutoRotate = false;
    clearTimeout(window._rotateTimeout);
    window._rotateTimeout = setTimeout(() => {
      isAutoRotate = true;
    }, 3000);
  }

  function onResize(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    if (!brickGroup) return;
    animationId = requestAnimationFrame(animate);

    // Smooth rotation
    if (isAutoRotate) {
      targetRotY += 0.003;
      targetRotX = Math.sin(Date.now() * 0.0003) * 0.1;
    } else {
      targetRotY += (mouseX * 0.5 - targetRotY) * 0.02;
      targetRotX += (mouseY * 0.3 - targetRotX) * 0.02;
    }

    brickGroup.rotation.y = targetRotY;
    brickGroup.rotation.x = targetRotX;

    // Subtle floating
    brickGroup.position.y = Math.sin(Date.now() * 0.001) * 0.04;

    renderer.render(scene, camera);
  }

  function destroy() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (renderer) {
      renderer.dispose();
    }
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }
  }

  return { init, destroy };
})();
