"use client";

import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 160;
const CONNECT_DISTANCE = 15;
const BOUNDS = { x: 48, y: 32, z: 28 };
const REPEL_RADIUS = 16;
const REPEL_STRENGTH = 0.42;

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

/** Hero arka planı: altın parçacıklardan oluşan, imlece tepki veren canlı bir "güven ağı" animasyonu. */
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
      camera.position.z = 64;

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
          x: (Math.random() - 0.5) * 0.04,
          y: (Math.random() - 0.5) * 0.04,
          z: (Math.random() - 0.5) * 0.04,
        });
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const glowTexture = makeGlowTexture(THREE);
      const material = new THREE.PointsMaterial({
        color: 0xdec28b,
        size: 2,
        map: glowTexture,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const maxLines = PARTICLE_COUNT * 6;
      const linePositions = new Float32Array(maxLines * 2 * 3);
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xb08d3f,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
      });
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);

      const raycaster = new THREE.Raycaster();
      const pointerNDC = new THREE.Vector2(0, 0);
      const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const mouseWorld = new THREE.Vector3();
      let hasPointer = false;
      let targetCamX = 0;
      let targetCamY = 0;

      // Pencere seviyesinde dinleniyor: üstteki gradient/metin katmanları
      // pointer olaylarını yakalasa bile fare takibi kesilmesin.
      const onPointerMove = (event: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        const inside =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (!inside) {
          hasPointer = false;
          targetCamX = 0;
          targetCamY = 0;
          return;
        }

        pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        hasPointer = true;
        targetCamX = pointerNDC.x * 26;
        targetCamY = pointerNDC.y * 16;
      };
      window.addEventListener("pointermove", onPointerMove);
      cleanupFns.push(() => window.removeEventListener("pointermove", onPointerMove));

      let animationId = 0;
      const posAttr = geometry.getAttribute("position") as InstanceType<typeof THREE.BufferAttribute>;
      const lineAttr = lineGeometry.getAttribute("position") as InstanceType<typeof THREE.BufferAttribute>;

      function animate() {
        animationId = requestAnimationFrame(animate);

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

          points.rotation.y += 0.0009;
          lines.rotation.y = points.rotation.y;
        }

        camera.position.x += (targetCamX - camera.position.x) * 0.045;
        camera.position.y += (targetCamY - camera.position.y) * 0.045;
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
