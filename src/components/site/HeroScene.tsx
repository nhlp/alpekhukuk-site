"use client";

import { useEffect, useRef } from "react";

const DUST_COUNT = 70;
const DUST_BOUNDS = { x: 50, y: 32, z: 30 };
const MAX_TILT = 0.32; // radyan, ~18°

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

function buildScale(THREE: typeof import("three"), material: import("three").Material) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4, 1, 40), material);
  base.position.y = -15;
  group.add(base);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 27, 20), material);
  pole.position.y = -1.5;
  group.add(pole);

  const finial = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), material);
  finial.position.y = 13;
  group.add(finial);

  const beamGroup = new THREE.Group();
  beamGroup.position.y = 11.8;
  group.add(beamGroup);

  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 23, 20), material);
  beam.rotation.z = Math.PI / 2;
  beamGroup.add(beam);

  const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 20), material);
  beamGroup.add(pivot);

  const chainMaterial = new THREE.LineBasicMaterial({
    color: 0xd9bd7e,
    transparent: true,
    opacity: 0.55,
  });

  function makePan(offsetX: number) {
    const panGroup = new THREE.Group();
    panGroup.position.x = offsetX;
    beamGroup.add(panGroup);

    const chainPoints = [
      new THREE.Vector3(-2.6, 0, 0),
      new THREE.Vector3(0, -6.5, 0),
      new THREE.Vector3(2.6, 0, 0),
      new THREE.Vector3(0, -6.5, 0),
      new THREE.Vector3(0, -1.5, -2.6),
      new THREE.Vector3(0, -6.5, 0),
      new THREE.Vector3(0, -1.5, 2.6),
      new THREE.Vector3(0, -6.5, 0),
    ];
    const chainGeometry = new THREE.BufferGeometry().setFromPoints(chainPoints);
    panGroup.add(new THREE.LineSegments(chainGeometry, chainMaterial));

    const pan = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.22, 12, 32), material);
    pan.rotation.x = Math.PI / 2;
    pan.position.y = -6.5;
    panGroup.add(pan);

    const panFloor = new THREE.Mesh(
      new THREE.CircleGeometry(2.8, 32),
      new THREE.MeshStandardMaterial({
        color: 0xd9bd7e,
        metalness: 0.6,
        roughness: 0.4,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
      }),
    );
    panFloor.rotation.x = -Math.PI / 2;
    panFloor.position.y = -6.48;
    panGroup.add(panFloor);

    return panGroup;
  }

  const leftPan = makePan(-11);
  const rightPan = makePan(11);

  return { group, beamGroup, leftPan, rightPan };
}

/** Hero arka planı: fareyle dengeyi değiştirebileceğiniz, altın renkli bir adalet terazisi. */
export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dar ekranlarda metinle çakışmaması ve performans için 3D sahne yerine
    // sade bir gradyan (globals.css / section arka planı) gösterilir.
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
      camera.position.set(0, 2, 78);

      // Terazinin metin sütununa binmemesi için görünür genişliğe göre sağa kaydır.
      function computeScaleOffsetX() {
        const distance = camera.position.z;
        const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * distance;
        const visibleWidth = visibleHeight * camera.aspect;
        return Math.min(visibleWidth * 0.27, 32);
      }

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xfff3dd, 1.1));
      const keyLight = new THREE.DirectionalLight(0xffe9c2, 2.4);
      keyLight.position.set(30, 40, 50);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xffe9c2, 1.1);
      fillLight.position.set(-20, 10, 40);
      scene.add(fillLight);
      const rimLight = new THREE.DirectionalLight(0x9fb6dd, 0.7);
      rimLight.position.set(-30, -10, -20);
      scene.add(rimLight);

      const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xf1d9a0,
        metalness: 0.6,
        roughness: 0.35,
        emissive: 0x3a2a10,
        emissiveIntensity: 0.5,
      });
      const { group: scaleGroup, beamGroup } = buildScale(THREE, goldMaterial);
      scaleGroup.scale.setScalar(1.15);
      scaleGroup.position.x = computeScaleOffsetX();
      scene.add(scaleGroup);

      // Etraftaki ince altın toz zerrecikleri (atmosfer için).
      const dustPositions = new Float32Array(DUST_COUNT * 3);
      const dustVelocities: { x: number; y: number; z: number }[] = [];
      for (let i = 0; i < DUST_COUNT; i++) {
        dustPositions[i * 3] = (Math.random() - 0.5) * DUST_BOUNDS.x * 2;
        dustPositions[i * 3 + 1] = (Math.random() - 0.5) * DUST_BOUNDS.y * 2;
        dustPositions[i * 3 + 2] = (Math.random() - 0.5) * DUST_BOUNDS.z * 2 - 10;
        dustVelocities.push({
          x: (Math.random() - 0.5) * 0.015,
          y: (Math.random() - 0.5) * 0.015,
          z: (Math.random() - 0.5) * 0.015,
        });
      }
      const dustGeometry = new THREE.BufferGeometry();
      dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
      const glowTexture = makeGlowTexture(THREE);
      const dustMaterial = new THREE.PointsMaterial({
        color: 0xd9bd7e,
        size: 1.3,
        map: glowTexture,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const dust = new THREE.Points(dustGeometry, dustMaterial);
      scene.add(dust);
      const dustAttr = dustGeometry.getAttribute("position") as InstanceType<
        typeof THREE.BufferAttribute
      >;

      let targetTilt = 0;
      let targetYaw = 0;
      let hasPointer = false;

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

        const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        hasPointer = true;
        targetTilt = nx * MAX_TILT;
        targetYaw = nx * 0.35 + ny * 0.06;
      };
      window.addEventListener("pointermove", onPointerMove);
      cleanupFns.push(() => window.removeEventListener("pointermove", onPointerMove));

      let animationId = 0;
      let t = 0;

      function animate() {
        animationId = requestAnimationFrame(animate);
        t += 0.01;

        if (!reduceMotion) {
          for (let i = 0; i < DUST_COUNT; i++) {
            const x = dustAttr.getX(i) + dustVelocities[i].x;
            const y = dustAttr.getY(i) + dustVelocities[i].y;
            const z = dustAttr.getZ(i) + dustVelocities[i].z;
            if (x > DUST_BOUNDS.x || x < -DUST_BOUNDS.x) dustVelocities[i].x *= -1;
            if (y > DUST_BOUNDS.y || y < -DUST_BOUNDS.y) dustVelocities[i].y *= -1;
            if (z > 10 || z < -DUST_BOUNDS.z - 10) dustVelocities[i].z *= -1;
            dustAttr.setXYZ(i, x, y, z);
          }
          dustAttr.needsUpdate = true;

          const idleTilt = hasPointer ? 0 : Math.sin(t * 0.6) * 0.05;
          beamGroup.rotation.z += ((targetTilt || idleTilt) - beamGroup.rotation.z) * 0.05;
          scaleGroup.rotation.y += ((hasPointer ? targetYaw : Math.sin(t * 0.15) * 0.2) - scaleGroup.rotation.y) * 0.03;
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
        dustGeometry.dispose();
        dustMaterial.dispose();
        glowTexture.dispose();
        scaleGroup.traverse((obj) => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
            obj.geometry.dispose();
          }
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
