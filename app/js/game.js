/**
 * JumpJump Master Game Controller
 * Pure WebGL Three.js isometric rendering, smooth 60fps/120fps loop, precise collision physics
 */

class JumpGame {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scoreEl = document.getElementById('score-display');
        this.highScoreEl = document.getElementById('high-score-display');
        this.comboEl = document.getElementById('combo-display');
        this.floatingContainer = document.getElementById('floating-scores');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.finalScoreEl = document.getElementById('final-score');
        this.finalBestEl = document.getElementById('final-best');
        this.restartBtn = document.getElementById('restart-btn');
        this.instructionEl = document.getElementById('instruction');

        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('jump_jump_high_score') || '0', 10);
        this.comboStreak = 0;
        this.hasStarted = false;

        this.currentBlock = null;
        this.nextBlock = null;
        this.nextDir = 'x'; // 'x' or 'z'

        // Three.js Core
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // Camera Follow Target
        this.cameraLookAt = new THREE.Vector3(0, 2, 0);
        this.targetCameraLookAt = new THREE.Vector3(0, 2, 0);
        this.cameraOffset = new THREE.Vector3(-26, 36, -26);

        // Ripples collection
        this.ripples = [];

        this.initThree();
        this.initGame();
        this.bindEvents();
        this.updateUI();

        // Start render loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initThree() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xdce9f2);
        this.scene.fog = new THREE.Fog(0xdce9f2, 50, 160);

        // Isometric Orthographic Camera
        const aspect = window.innerWidth / window.innerHeight;
        const d = 13.5;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, -120, 500);
        this.camera.position.copy(this.cameraLookAt).add(this.cameraOffset);
        this.camera.lookAt(this.cameraLookAt);

        // WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // Cap pixel ratio at 2.0 to ensure 60fps/120fps without thermal throttling on high-res iPhones
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);

        // Lighting
        // Ambient soft fill light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
        this.scene.add(ambientLight);

        // Directional Sun Light (casts soft shadows)
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.58);
        dirLight.position.set(-25, 45, -15);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 10;
        dirLight.shadow.camera.far = 120;
        const shadowD = 18;
        dirLight.shadow.camera.left = -shadowD;
        dirLight.shadow.camera.right = shadowD;
        dirLight.shadow.camera.top = shadowD;
        dirLight.shadow.camera.bottom = -shadowD;
        dirLight.shadow.bias = -0.001;
        this.scene.add(dirLight);
        this.dirLight = dirLight;

        // Sub Light for subtle warm fill
        const fillLight = new THREE.DirectionalLight(0xfff5ea, 0.28);
        fillLight.position.set(20, 20, 30);
        this.scene.add(fillLight);

        // Managers
        this.blockManager = new BlockManager(this.scene);
        this.player = new Player(this.scene);
    }

    initGame() {
        this.score = 0;
        this.comboStreak = 0;
        this.blockManager.reset();
        this.player.reset();

        // Detect touch vs desktop for instructions
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (this.instructionEl) {
            this.instructionEl.textContent = isTouch ? '长按屏幕蓄力，松开起跳' : '按住空格键或鼠标左键蓄力，松开起跳';
        }

        // 1. Initial base block at (0, 0)
        this.currentBlock = this.blockManager.createBlock(0, 0, 0);
        this.currentBlock.isSpawning = false;
        this.currentBlock.group.position.y = 0;

        // Player stands on initial block
        this.player.setPosition(0, this.currentBlock.topY, 0);

        // 2. Spawn next block
        this.spawnNextBlock();

        // Camera setup
        this.cameraLookAt.set(0, 2, 0);
        this.targetCameraLookAt.set(
            (this.currentBlock.x + this.nextBlock.x) * 0.5,
            2,
            (this.currentBlock.z + this.nextBlock.z) * 0.5
        );
        this.camera.position.copy(this.cameraLookAt).add(this.cameraOffset);
        this.camera.lookAt(this.cameraLookAt);

        this.updateUI();
        this.gameOverModal.classList.add('hidden');
    }

    spawnNextBlock() {
        // Random direction: 'x' (forward-right) or 'z' (forward-left)
        this.nextDir = Math.random() < 0.5 ? 'x' : 'z';

        // Distance between 3.2 and 5.0
        const distance = 3.2 + Math.random() * 1.8;

        const nextX = this.nextDir === 'x' ? this.currentBlock.x + distance : this.currentBlock.x;
        const nextZ = this.nextDir === 'z' ? this.currentBlock.z + distance : this.currentBlock.z;

        this.nextBlock = this.blockManager.createBlock(nextX, nextZ);

        // Smooth camera follow target moves to midpoint
        this.targetCameraLookAt.set(
            (this.currentBlock.x + this.nextBlock.x) * 0.5,
            2,
            (this.currentBlock.z + this.nextBlock.z) * 0.5
        );
    }

    bindEvents() {
        const onPointerDown = (e) => {
            if (e.target.closest('#game-over-modal')) return;
            if (this.player.state !== 'IDLE') return;

            if (!this.hasStarted) {
                this.hasStarted = true;
                if (this.instructionEl) {
                    this.instructionEl.style.opacity = '0';
                    setTimeout(() => {
                        if (this.instructionEl) this.instructionEl.style.display = 'none';
                    }, 400);
                }
            }

            this.player.startCharging();
            window.soundEngine.startCharge();
        };

        const onPointerUp = (e) => {
            if (this.player.state !== 'CHARGING') return;

            window.soundEngine.stopCharge();
            if (this.currentBlock && this.currentBlock.resetDip) {
                this.currentBlock.resetDip();
            }

            const jumpInfo = this.player.releaseJump(this.nextDir, this.currentBlock, this.nextBlock);
            if (jumpInfo) {
                window.soundEngine.playJump();
            }
        };

        window.addEventListener('pointerdown', onPointerDown, { passive: false });
        window.addEventListener('pointerup', onPointerUp, { passive: false });
        window.addEventListener('pointercancel', onPointerUp, { passive: false });

        // Keyboard Controls for Desktop (Space to jump, R to restart)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                if (!this.gameOverModal.classList.contains('hidden')) {
                    this.initGame();
                    return;
                }
                if (this.player.state === 'IDLE') {
                    if (!this.hasStarted) {
                        this.hasStarted = true;
                        if (this.instructionEl) {
                            this.instructionEl.style.opacity = '0';
                            setTimeout(() => {
                                if (this.instructionEl) this.instructionEl.style.display = 'none';
                            }, 400);
                        }
                    }
                    this.player.startCharging();
                    window.soundEngine.startCharge();
                }
            } else if ((e.code === 'KeyR' || e.code === 'Enter') && !e.repeat) {
                if (!this.gameOverModal.classList.contains('hidden')) {
                    e.preventDefault();
                    window.soundEngine.triggerHaptic('light');
                    this.initGame();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.player.state === 'CHARGING') {
                    window.soundEngine.stopCharge();
                    if (this.currentBlock && this.currentBlock.resetDip) {
                        this.currentBlock.resetDip();
                    }
                    const jumpInfo = this.player.releaseJump(this.nextDir, this.currentBlock, this.nextBlock);
                    if (jumpInfo) {
                        window.soundEngine.playJump();
                    }
                }
            }
        });

        // Prevent iOS bounce & gesture defaults
        window.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

        // Resize handler
        window.addEventListener('resize', () => this.onResize());

        // Restart button
        this.restartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.soundEngine.triggerHaptic('light');
            this.initGame();
        });
    }

    onResize() {
        const aspect = window.innerWidth / window.innerHeight;
        const d = 13.5;
        this.camera.left = -d * aspect;
        this.camera.right = d * aspect;
        this.camera.top = d;
        this.camera.bottom = -d;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    }

    /**
     * Check jump landing
     */
    checkLanding() {
        const px = this.player.group.position.x;
        const pz = this.player.group.position.z;

        const nextX = this.nextBlock.x;
        const nextZ = this.nextBlock.z;
        const curX = this.currentBlock.x;
        const curZ = this.currentBlock.z;

        const distToNext = Math.hypot(px - nextX, pz - nextZ);
        const distToCur = Math.hypot(px - curX, pz - curZ);

        const nextRadius = this.nextBlock.radius;
        const centerThreshold = nextRadius * 0.28;
        const safeThreshold = nextRadius * 0.94;

        if (distToNext <= safeThreshold) {
            // SUCCESSFUL LANDING ON NEXT BLOCK!
            const isCenter = distToNext <= centerThreshold;
            let points = 1;

            if (isCenter) {
                this.comboStreak++;
                points = this.comboStreak * 2;
                this.createCenterRipple(nextX, nextZ, this.nextBlock.topY);
                window.soundEngine.playCombo(this.comboStreak);
                this.showFloatingScore(`+${points}`, isCenter, this.comboStreak);
            } else {
                this.comboStreak = 0;
                points = 1;
                window.soundEngine.playLand();
                this.showFloatingScore(`+1`, false, 0);
            }

            this.score += points;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('jump_jump_high_score', this.highScore.toString());
            }

            this.player.landOnBlock(this.nextBlock.topY);
            this.currentBlock = this.nextBlock;
            this.spawnNextBlock();
            this.blockManager.cleanOldBlocks(7);
            this.updateUI();

        } else if (distToCur <= this.currentBlock.radius * 0.88) {
            // LANDED BACK ON CURRENT BLOCK (barely pressed)
            this.player.landOnBlock(this.currentBlock.topY);
            window.soundEngine.playLand();
            this.comboStreak = 0;
            this.updateUI();

        } else {
            // MISSED! TUMBLE & GAME OVER
            let fallAxis = new THREE.Vector3(1, 0, 0);
            if (this.nextDir === 'x') {
                fallAxis.set(0, 0, px > nextX ? 1 : -1);
            } else {
                fallAxis.set(pz > nextZ ? -1 : 1, 0, 0);
            }

            this.player.startFalling(fallAxis);
            window.soundEngine.playFall();

            setTimeout(() => {
                this.triggerGameOver();
            }, 650);
        }
    }

    createCenterRipple(x, z, y) {
        const ringGeom = new THREE.RingGeometry(0.15, 0.32, 36);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95
        });
        const mesh = new THREE.Mesh(ringGeom, ringMat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, y + 0.015, z);
        this.scene.add(mesh);

        this.ripples.push({
            mesh: mesh,
            progress: 0,
            duration: 0.42
        });
    }

    showFloatingScore(text, isCenter, streak) {
        // Project 3D landing position to 2D screen coordinates
        const landingPos = new THREE.Vector3(
            this.player.group.position.x,
            this.player.group.position.y + 1.2,
            this.player.group.position.z
        );
        landingPos.project(this.camera);

        const x = (landingPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-landingPos.y * 0.5 + 0.5) * window.innerHeight;

        const el = document.createElement('div');
        el.className = `floating-score ${isCenter ? 'center-hit' : ''}`;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.innerHTML = streak > 1 ? `<span>${text}</span><div class="streak-sub">连中 ×${streak}</div>` : text;

        this.floatingContainer.appendChild(el);

        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 850);
    }

    triggerGameOver() {
        this.finalScoreEl.textContent = this.score;
        this.finalBestEl.textContent = this.highScore;
        this.gameOverModal.classList.remove('hidden');
        window.soundEngine.triggerHaptic('error');
    }

    updateUI() {
        this.scoreEl.textContent = this.score;
        this.highScoreEl.textContent = `历史最高: ${this.highScore}`;

        if (this.comboStreak > 1) {
            this.comboEl.textContent = `连中 ×${this.comboStreak} !`;
            this.comboEl.style.opacity = '1';
        } else {
            this.comboEl.style.opacity = '0';
        }
    }

    animate() {
        requestAnimationFrame(this.animate);

        const deltaTime = Math.min(this.clock.getDelta(), 0.05);

        // Update player
        if (this.player) {
            this.player.update(deltaTime, this.currentBlock);
            if (this.player.state === 'JUMPING' && this.player.jumpProgress >= 1.0) {
                this.checkLanding();
            }
        }

        // Update block spawning bounce
        if (this.blockManager) {
            this.blockManager.update(deltaTime);
        }

        // Update center ripples
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.progress += deltaTime / r.duration;
            if (r.progress >= 1.0) {
                this.scene.remove(r.mesh);
                r.mesh.geometry.dispose();
                r.mesh.material.dispose();
                this.ripples.splice(i, 1);
            } else {
                const s = 1.0 + r.progress * 4.8;
                r.mesh.scale.set(s, s, 1.0);
                r.mesh.material.opacity = (1.0 - r.progress) * 0.9;
            }
        }

        // Smooth camera damping lerp
        this.cameraLookAt.lerp(this.targetCameraLookAt, 0.065);
        this.camera.position.copy(this.cameraLookAt).add(this.cameraOffset);
        this.camera.lookAt(this.cameraLookAt);

        // Shadow light follows camera target
        if (this.dirLight) {
            this.dirLight.position.set(
                this.cameraLookAt.x - 25,
                this.cameraLookAt.y + 45,
                this.cameraLookAt.z - 15
            );
            this.dirLight.target.position.copy(this.cameraLookAt);
            this.dirLight.target.updateMatrixWorld();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Boot game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new JumpGame();

    // Register Service Worker for 100% offline PWA caching
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
            console.log('ServiceWorker registration skipped:', err);
        });
    }
});
