"use client";

import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 140;
const CONNECT_DISTANCE = 15;
const PARTICLE_BOUNDS = { x: 52, y: 32, z: 26 };
const REPEL_RADIUS = 15;
const REPEL_STRENGTH = 0.38;
const MAX_TILT = 0.3; // radyan, ~17°

function makeGlowTexture(THREE: typeof import("three")) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(255,255,255,0.6)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

/** İki nokta arasına ince bir çubuk (zincir/destek) yerleştirir. */
function makeRod(
  THREE: typeof import("three"),
  from: import("three").Vector3,
  to: import("three").Vector3,
  radius: number,
  material: import("three").Material,
) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const length = dir.length();
  const geometry = new THREE.CylinderGeometry(radius, radius, length, 8);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(from).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return mesh;
}

function buildScale(THREE: typeof import("three"), material: import("three").Material) {
  const group = new THREE.Group();

  // Taban: iki katmanlı, heykel benzeri
  const baseLower = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.7, 0.7, 48), material);
  baseLower.position.y = -15.6;
  group.add(baseLower);
  const baseUpper = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.5, 0.6, 48), material);
  baseUpper.position.y = -14.9;
  group.add(baseUpper);

  // Direk + süsleme yakası
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 26, 24), material);
  pole.position.y = -1.7;
  group.add(pole);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.11, 14, 28), material);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = -7;
  group.add(collar);

  // Tepe süsü
  const finialCollar = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.1, 12, 28), material);
  finialCollar.rotation.x = Math.PI / 2;
  finialCollar.position.y = 11.2;
  group.add(finialCollar);
  const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.95, 0), material);
  finial.position.y = 12.6;
  group.add(finial);

  // Kiriş (kefelerin asılı olduğu kol)
  const beamGroup = new THREE.Group();
  beamGroup.position.y = 11.2;
  group.add(beamGroup);

  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 24, 20), material);
  beam.rotation.z = Math.PI / 2;
  beamGroup.add(beam);
  for (const side of [-1, 1]) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), material);
    cap.position.x = side * 12;
    beamGroup.add(cap);
  }
  const pivot = new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), material);
  beamGroup.add(pivot);

  const panProfile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.35, 0.05),
    new THREE.Vector2(1.6, 0.22),
    new THREE.Vector2(2.55, 0.42),
    new THREE.Vector2(2.85, 0.6),
    new THREE.Vector2(2.7, 0.64),
  ];
  const panGeometry = new THREE.LatheGeometry(panProfile, 40);

  function makePan(offsetX: number) {
    const panGroup = new THREE.Group();
    panGroup.position.x = offsetX;
    beamGroup.add(panGroup);

    const pan = new THREE.Mesh(panGeometry, material);
    pan.position.y = -7;
    panGroup.add(pan);

    const rodTop = new THREE.Vector3(0, -0.35, 0);
    const chainCount = 3;
    for (let i = 0; i < chainCount; i++) {
      const angle = (i / chainCount) * Math.PI * 2;
      const rimPoint = new THREE.Vector3(Math.cos(angle) * 2.55, -6.65, Math.sin(angle) * 2.55);
      panGroup.add(makeRod(THREE, rodTop, rimPoint, 0.045, material));
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 8, 20), material);
    ring.position.y = -0.35;
    panGroup.add(ring);

    return panGroup;
  }

  makePan(-12);
  makePan(12);

  return { group, beamGroup };
}

/** Hero arka planı: bağlantılı ışık ağı + fareyle dengesi değişen bir adalet terazisi. */
export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (window.matchMedia("(max-width: 767px)").matches) return;

    let cancelled = false;
    const cleanupFns: Array<() => void> = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("three").then((THREE) => {
      if (cancelled || !container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.set(0, 2, 80);

      function computeScaleOffsetX() {
        const distance = camera.position.z;
        const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * distance;
        const visibleWidth = visibleHeight * camera.aspect;
        return Math.min(visibleWidth * 0.26, 30);
      }

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xfff3dd, 1.05));
      const keyLight = new THREE.DirectionalLight(0xffe9c2, 2.3);
      keyLight.position.set(30, 40, 50);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xffe9c2, 1);
      fillLight.position.set(-20, 5, 40);
      scene.add(fillLight);
      const rimLight = new THREE.DirectionalLight(0x9fb6dd, 0.7);
      rimLight.position.set(-30, -10, -20);
      scene.add(rimLight);
      const sparkle = new THREE.PointLight(0xffe9c2, 60, 60);
      sparkle.position.set(15, 20, 45);
      scene.add(sparkle);

      const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xecd39c,
        metalness: 0.8,
        roughness: 0.22,
        emissive: 0x2c1f0c,
        emissiveIntensity: 0.35,
      });
      const { group: scaleGroup, beamGroup } = buildScale(THREE, goldMaterial);
      scaleGroup.scale.setScalar(1.05);
      scaleGroup.position.x = computeScaleOffsetX();
      scene.add(scaleGroup);

      // Bağlantılı ışık ağı (parçacıklar + çizgiler)
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const velocities: { x: number; y: number; z: number }[] = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * PARTICLE_BOUNDS.x * 2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * PARTICLE_BOUNDS.y * 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * PARTICLE_BOUNDS.z * 2 - 6;
        velocities.push({
          x: (Math.random() - 0.5) * 0.035,
          y: (Math.random() - 0.5) * 0.035,
          z: (Math.random() - 0.5) * 0.035,
        });
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const glowTexture = makeGlowTexture(THREE);
      const particleMaterial = new THREE.PointsMaterial({
        color: 0xd9bd7e,
        size: 1.6,
        map: glowTexture,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geometry, particleMaterial);
      scene.add(points);

      const maxLines = PARTICLE_COUNT * 5;
      const linePositions = new Float32Array(maxLines * 2 * 3);
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xb08d3f,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
      });
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);

      const posAttr = geometry.getAttribute("position") as InstanceType<typeof THREE.BufferAttribute>;
      const lineAttr = lineGeometry.getAttribute("position") as InstanceType<
        typeof THREE.BufferAttribute
      >;

      const raycaster = new THREE.Raycaster();
      const pointerNDC = new THREE.Vector2(0, 0);
      const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const mouseWorld = new THREE.Vector3();
      let hasPointer = false;
      let targetTilt = 0;
      let targetYaw = 0;

      const onPointerMove = (event: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        const inside =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (!inside) {
          hasPointer = false;
          targetTilt = 0;
          targetYaw = 0;
          return;
        }

        pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        hasPointer = true;
        targetTilt = pointerNDC.x * MAX_TILT;
        targetYaw = pointerNDC.x * 0.3 + pointerNDC.y * 0.05;
      };
      window.addEventListener("pointermove", onPointerMove);
      cleanupFns.push(() => window.removeEventListener("pointermove", onPointerMove));

      let animationId = 0;
      let t = 0;

      function animate() {
        animationId = requestAnimationFrame(animate);
        t += 0.01;

        if (hasPointer) {
          raycaster.setFromCamera(pointerNDC, camera);
          raycaster.ray.intersectPlane(dragPlane, mouseWorld);
        }

        if (!reduceMotion) {
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            let x = posAttr.getX(i) + velocities[i].x;
            let y = posAttr.getY(i) + velocities[i].y;
            const z = posAttr.getZ(i) + velocities[i].z;

            if (hasPointer) {
              const dx = x - mouseWorld.x;
              const dy = y - mouseWorld.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < REPEL_RADIUS && dist > 0.001) {
                const push = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
                x += (dx / dist) * push;
                y += (dy / dist) * push;
              }
            }

            if (x > PARTICLE_BOUNDS.x || x < -PARTICLE_BOUNDS.x) velocities[i].x *= -1;
            if (y > PARTICLE_BOUNDS.y || y < -PARTICLE_BOUNDS.y) velocities[i].y *= -1;
            if (z > 6 || z < -PARTICLE_BOUNDS.z - 6) velocities[i].z *= -1;
            posAttr.setXYZ(i, x, y, z);
          }
          posAttr.needsUpdate = true;

          let lineIdx = 0;
          for (let i = 0; i < PARTICLE_COUNT && lineIdx < maxLines; i++) {
            for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < maxLines; j++) {
              const dx = posAttr.getX(i) - posAttr.getX(j);
              const dy = posAttr.getY(i) - posAttr.getY(j);
              const dz = posAttr.getZ(i) - posAttr.getZ(j);
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (dist < CONNECT_DISTANCE) {
                lineAttr.setXYZ(lineIdx * 2, posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
                lineAttr.setXYZ(lineIdx * 2 + 1, posAttr.getX(j), posAttr.getY(j), posAttr.getZ(j));
                lineIdx++;
              }
            }
          }
          lineGeometry.setDrawRange(0, lineIdx * 2);
          lineAttr.needsUpdate = true;

          const idleTilt = hasPointer ? 0 : Math.sin(t * 0.6) * 0.05;
          beamGroup.rotation.z += ((targetTilt || idleTilt) - beamGroup.rotation.z) * 0.05;
          scaleGroup.rotation.y +=
            ((hasPointer ? targetYaw : Math.sin(t * 0.15) * 0.18) - scaleGroup.rotation.y) * 0.03;
        }

        renderer.render(scene, camera);
      }
      animate();
      cleanupFns.push(() => cancelAnimationFrame(animationId));

      const onResize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        scaleGroup.position.x = computeScaleOffsetX();
      };
      window.addEventListener("resize", onResize);
      cleanupFns.push(() => window.removeEventListener("resize", onResize));

      cleanupFns.push(() => {
        renderer.dispose();
        renderer.domElement.remove();
        goldMaterial.dispose();
        geometry.dispose();
        lineGeometry.dispose();
        particleMaterial.dispose();
        lineMaterial.dispose();
        glowTexture.dispose();
        scaleGroup.traverse((obj) => {
          if (obj instanceof THREE.Mesh) obj.geometry.dispose();
        });
      });
    });

    return () => {
      cancelled = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />;
}
