"use client";

import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 110;
const CONNECT_DISTANCE = 15;
const BOUNDS = { x: 46, y: 30, z: 26 };

function makeGlowTexture(THREE: typeof import("three")) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(255,255,255,0.7)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

/** Hero arka planı: altın parçacıklardan oluşan, fareyle hafifçe paralaks yapan bir "güven ağı" animasyonu. */
export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    const cleanupFns: Array<() => void> = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("three").then((THREE) => {
      if (cancelled || !container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
      camera.position.z = 62;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const velocities: { x: number; y: number; z: number }[] = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * BOUNDS.x * 2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * BOUNDS.y * 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * BOUNDS.z * 2;
        velocities.push({
          x: (Math.random() - 0.5) * 0.035,
          y: (Math.random() - 0.5) * 0.035,
          z: (Math.random() - 0.5) * 0.035,
        });
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const glowTexture = makeGlowTexture(THREE);
      const material = new THREE.PointsMaterial({
        color: 0xd9bd7e,
        size: 1.7,
        map: glowTexture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const maxLines = PARTICLE_COUNT * 5;
      const linePositions = new Float32Array(maxLines * 2 * 3);
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xb08d3f,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
      });
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);

      let targetX = 0;
      let targetY = 0;
      const onPointerMove = (event: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        targetX = (((event.clientX - rect.left) / rect.width) * 2 - 1) * 18;
        targetY = -(((event.clientY - rect.top) / rect.height) * 2 - 1) * 12;
      };
      container.addEventListener("pointermove", onPointerMove);
      cleanupFns.push(() => container.removeEventListener("pointermove", onPointerMove));

      let animationId = 0;
      const posAttr = geometry.getAttribute("position") as InstanceType<typeof THREE.BufferAttribute>;
      const lineAttr = lineGeometry.getAttribute("position") as InstanceType<typeof THREE.BufferAttribute>;

      function animate() {
        animationId = requestAnimationFrame(animate);

        if (!reduceMotion) {
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            let x = posAttr.getX(i) + velocities[i].x;
            let y = posAttr.getY(i) + velocities[i].y;
            let z = posAttr.getZ(i) + velocities[i].z;
            if (x > BOUNDS.x || x < -BOUNDS.x) velocities[i].x *= -1;
            if (y > BOUNDS.y || y < -BOUNDS.y) velocities[i].y *= -1;
            if (z > BOUNDS.z || z < -BOUNDS.z) velocities[i].z *= -1;
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

          points.rotation.y += 0.0007;
          lines.rotation.y = points.rotation.y;
        }

        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (targetY - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

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
      };
      window.addEventListener("resize", onResize);
      cleanupFns.push(() => window.removeEventListener("resize", onResize));

      cleanupFns.push(() => {
        renderer.dispose();
        renderer.domElement.remove();
        geometry.dispose();
        lineGeometry.dispose();
        material.dispose();
        lineMaterial.dispose();
        glowTexture.dispose();
      });
    });

    return () => {
      cancelled = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />;
}
