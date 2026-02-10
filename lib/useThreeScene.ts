import { useRef, useMemo, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  originalPosition: THREE.Vector3;
  size: number;
  color: THREE.Color;
  isAccent: boolean;
}

interface UseThreeSceneOptions {
  particleCount?: number;
  accentParticleCount?: number;
  backgroundColor?: string;
  accentColor?: string;
  baseColor?: string;
}

export function useThreeScene(options: UseThreeSceneOptions = {}) {
  const {
    particleCount = 150,
    accentParticleCount = 25,
    accentColor = '#FF2E63',
    baseColor = '#C4C4B9',
  } = options;

  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef({ y: 0, targetY: 0, velocity: 0 });
  const particleDataRef = useRef<ParticleData[]>([]);
  
  const { viewport, size } = useThree();

  // Check for mobile/touch devices
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches || 
           window.matchMedia('(max-width: 768px)').matches;
  }, []);

  // Generate particle positions and attributes
  const { geometry, material } = useMemo(() => {
    const totalParticles = particleCount + accentParticleCount;
    const positions = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);
    const colors = new Float32Array(totalParticles * 3);
    
    const baseColorObj = new THREE.Color(baseColor);
    const accentColorObj = new THREE.Color(accentColor);
    
    particleDataRef.current = [];

    // Generate base particles
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * viewport.width * 1.5;
      const y = (Math.random() - 0.5) * viewport.height * 1.5;
      const z = (Math.random() - 0.5) * 4;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      const size = Math.random() * 3 + 1;
      sizes[i] = size;
      
      colors[i * 3] = baseColorObj.r;
      colors[i * 3 + 1] = baseColorObj.g;
      colors[i * 3 + 2] = baseColorObj.b;
      
      particleDataRef.current.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(0, 0, 0),
        originalPosition: new THREE.Vector3(x, y, z),
        size,
        color: baseColorObj.clone(),
        isAccent: false,
      });
    }

    // Generate accent particles (neon coral)
    for (let i = particleCount; i < totalParticles; i++) {
      const x = (Math.random() - 0.5) * viewport.width * 1.2;
      const y = (Math.random() - 0.5) * viewport.height * 1.2;
      const z = (Math.random() - 0.5) * 3;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      const size = Math.random() * 4 + 2;
      sizes[i] = size;
      
      colors[i * 3] = accentColorObj.r;
      colors[i * 3 + 1] = accentColorObj.g;
      colors[i * 3 + 2] = accentColorObj.b;
      
      particleDataRef.current.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(0, 0, 0),
        originalPosition: new THREE.Vector3(x, y, z),
        size,
        color: accentColorObj.clone(),
        isAccent: true,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uScrollVelocity: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uScrollVelocity;
        uniform float uPixelRatio;
        
        attribute float aSize;
        attribute vec3 aColor;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vColor = aColor;
          
          vec3 pos = position;
          
          // Gentle floating motion
          float floatOffset = sin(uTime * 0.5 + position.x * 0.3) * 0.15;
          float floatOffset2 = cos(uTime * 0.3 + position.y * 0.2) * 0.1;
          pos.z += floatOffset + floatOffset2;
          
          // Mouse parallax - particles follow mouse slightly
          float mouseInfluence = aSize * 0.02;
          pos.x += uMouse.x * mouseInfluence;
          pos.y += uMouse.y * mouseInfluence;
          
          // Scroll warp effect
          float scrollWarp = uScrollVelocity * 0.001;
          pos.z += scrollWarp * (abs(position.x) + abs(position.y));
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Size attenuation
          gl_PointSize = aSize * uPixelRatio * (300.0 / -mvPosition.z);
          
          // Fade based on depth
          vAlpha = smoothstep(8.0, -8.0, pos.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          // Circular particle shape
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          // Soft edge
          float alpha = smoothstep(0.5, 0.2, dist) * vAlpha;
          
          // Glow effect for accent particles
          float glow = smoothstep(0.5, 0.0, dist) * 0.5;
          vec3 finalColor = vColor + vec3(glow);
          
          gl_FragColor = vec4(finalColor, alpha * 0.8);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, [viewport.width, viewport.height, particleCount, accentParticleCount, baseColor, accentColor]);

  // Mouse move handler with throttling for performance
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const x = (event.clientX / size.width) * 2 - 1;
    const y = -(event.clientY / size.height) * 2 + 1;
    mouseRef.current.targetX = x * 2;
    mouseRef.current.targetY = y * 2;
  }, [size.width, size.height]);

  // Scroll handler
  const handleScroll = useCallback(() => {
    const currentY = window.scrollY || 0;
    const delta = currentY - scrollRef.current.y;
    scrollRef.current.targetY = currentY;
    scrollRef.current.velocity = scrollRef.current.velocity * 0.9 + delta * 0.1;
  }, []);

  // Animation frame
  useFrame((state) => {
    const { clock } = state;
    const time = clock.getElapsedTime();
    
    // Smooth mouse interpolation
    const mouseLerpFactor = isMobile ? 0.05 : 0.08;
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * mouseLerpFactor;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * mouseLerpFactor;
    
    // Smooth scroll velocity decay
    scrollRef.current.velocity *= 0.95;
    scrollRef.current.y = scrollRef.current.targetY;
    
    // Update uniforms
    if (material.uniforms) {
      material.uniforms.uTime.value = time;
      material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
      material.uniforms.uScrollVelocity.value = scrollRef.current.velocity;
    }

    // Subtle camera movement for parallax
    if (groupRef.current) {
      groupRef.current.rotation.x = mouseRef.current.y * 0.02;
      groupRef.current.rotation.y = mouseRef.current.x * 0.02;
    }

    // Update geometry positions for cluster effect
    if (particlesRef.current && !isMobile) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleDataRef.current.length; i++) {
        const data = particleDataRef.current[i];
        
        // Mouse clustering effect
        const mousePos = new THREE.Vector3(
          mouseRef.current.x * viewport.width * 0.3,
          mouseRef.current.y * viewport.height * 0.3,
          0
        );
        
        const dist = data.position.distanceTo(mousePos);
        const clusterStrength = data.isAccent ? 0.015 : 0.008;
        const maxDist = data.isAccent ? 8 : 5;
        
        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist * clusterStrength;
          data.velocity.x += (mousePos.x - data.position.x) * force;
          data.velocity.y += (mousePos.y - data.position.y) * force;
        }
        
        // Spring back to original position
        const springStrength = 0.02;
        data.velocity.x += (data.originalPosition.x - data.position.x) * springStrength;
        data.velocity.y += (data.originalPosition.y - data.position.y) * springStrength;
        data.velocity.z += (data.originalPosition.z - data.position.z) * springStrength;
        
        // Damping
        data.velocity.multiplyScalar(0.94);
        
        // Update position
        data.position.add(data.velocity);
        
        positions[i * 3] = data.position.x;
        positions[i * 3 + 1] = data.position.y;
        positions[i * 3 + 2] = data.position.z;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return {
    groupRef,
    particlesRef,
    geometry,
    material,
    isMobile,
    handleMouseMove,
    handleScroll,
    mouseRef,
    scrollRef,
  };
}
