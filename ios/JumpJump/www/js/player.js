/**
 * JumpJump Player Character (跳跳小人)
 * Authentic WeChat Jump geometry, squash & stretch, somersault flip & tumble physics
 */

class Player {
    constructor(scene) {
        this.scene = scene;
        this.state = 'IDLE'; // IDLE, CHARGING, JUMPING, SETTLING, FALLING

        this.chargeTime = 0;
        this.maxChargeTime = 1.8;
        this.chargeRate = 8.5; // distance per second of charge

        // Transforms hierarchy:
        // this.group (world pos) -> this.rotationGroup (flip) -> this.squashGroup (squash/stretch)
        this.group = new THREE.Group();
        this.rotationGroup = new THREE.Group();
        this.squashGroup = new THREE.Group();

        this.group.add(this.rotationGroup);
        this.rotationGroup.add(this.squashGroup);
        this.scene.add(this.group);

        this.buildMesh();
        this.buildShadow();

        // Jump physics state
        this.jumpStart = new THREE.Vector3();
        this.jumpEnd = new THREE.Vector3();
        this.jumpProgress = 0;
        this.jumpDuration = 0.65;
        this.jumpHeight = 3.2;
        this.jumpAxis = new THREE.Vector3(0, 0, 1);

        // Settle spring
        this.settleTime = 0;

        // Fall physics
        this.fallVelocity = 0;
        this.fallAngle = 0;
        this.fallAxis = new THREE.Vector3(1, 0, 0);
    }

    buildMesh() {
        // High quality dark slate purple-charcoal material
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x332f44,
            roughness: 0.35,
            metalness: 0.15
        });

        const highlightMat = new THREE.MeshStandardMaterial({
            color: 0x48425d,
            roughness: 0.3,
            metalness: 0.2
        });

        // 1. Base ring disc
        const baseGeom = new THREE.CylinderGeometry(0.46, 0.48, 0.16, 32);
        const baseMesh = new THREE.Mesh(baseGeom, bodyMat);
        baseMesh.position.y = 0.08;
        baseMesh.castShadow = true;
        this.squashGroup.add(baseMesh);

        // 2. Lower body tapered cone
        const bodyGeom = new THREE.CylinderGeometry(0.24, 0.44, 0.92, 32);
        const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
        bodyMesh.position.y = 0.62;
        bodyMesh.castShadow = true;
        this.squashGroup.add(bodyMesh);

        // 3. Neck collar
        const collarGeom = new THREE.CylinderGeometry(0.25, 0.23, 0.08, 32);
        const collarMesh = new THREE.Mesh(collarGeom, highlightMat);
        collarMesh.position.y = 1.10;
        collarMesh.castShadow = true;
        this.squashGroup.add(collarMesh);

        // 4. Head sphere
        const headGeom = new THREE.SphereGeometry(0.33, 32, 24);
        const headMesh = new THREE.Mesh(headGeom, bodyMat);
        headMesh.position.y = 1.45;
        headMesh.castShadow = true;
        this.squashGroup.add(headMesh);

        // 5. Specular highlight spot on head
        const spotGeom = new THREE.SphereGeometry(0.08, 16, 16);
        const spotMat = new THREE.MeshBasicMaterial({ color: 0x6e6688 });
        const spotMesh = new THREE.Mesh(spotGeom, spotMat);
        spotMesh.position.set(-0.10, 1.58, 0.15);
        this.squashGroup.add(spotMesh);
    }

    buildShadow() {
        // Soft blurred radial contact shadow
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
        grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.22)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);

        const shadowTexture = new THREE.CanvasTexture(canvas);
        const shadowGeom = new THREE.PlaneGeometry(1.2, 1.2);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            depthWrite: false
        });

        this.shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
        this.shadowMesh.rotation.x = -Math.PI / 2;
        this.shadowMesh.position.y = 0.01;
        this.scene.add(this.shadowMesh);
    }

    setPosition(x, y, z) {
        this.group.position.set(x, y, z);
        this.shadowMesh.position.set(x, y + 0.01, z);
    }

    /**
     * Start press-down charging
     */
    startCharging() {
        if (this.state !== 'IDLE') return;
        this.state = 'CHARGING';
        this.chargeTime = 0;
    }

    /**
     * Release charge and initiate jump
     */
    releaseJump(targetDir, currentBlock, nextBlock) {
        if (this.state !== 'CHARGING') return null;

        const time = Math.min(this.chargeTime, this.maxChargeTime);
        const distance = time * this.chargeRate;

        this.state = 'JUMPING';
        this.jumpProgress = 0;
        this.jumpDuration = Math.max(0.52, Math.min(0.76, 0.45 + distance * 0.06));
        this.jumpHeight = 2.4 + distance * 0.36;

        this.jumpStart.copy(this.group.position);
        this.jumpEnd.copy(this.jumpStart);

        if (targetDir === 'x') {
            this.jumpEnd.x += distance;
            // Somersault flip around Z axis (positive direction)
            this.jumpAxis.set(0, 0, 1);
        } else {
            this.jumpEnd.z += distance;
            // Somersault flip around X axis (negative direction)
            this.jumpAxis.set(-1, 0, 0);
        }

        // Return jump metadata for game collision checking
        return {
            distance: distance,
            endPos: this.jumpEnd.clone()
        };
    }

    /**
     * Update player animation loop
     */
    update(deltaTime, currentBlock) {
        if (this.state === 'CHARGING') {
            this.chargeTime += deltaTime;
            const progress = Math.min(1.0, this.chargeTime / this.maxChargeTime);

            // Squash down along Y, expand X and Z to preserve volume
            const scaleY = 1.0 - progress * 0.44; // min 0.56
            const scaleXZ = 1.0 + progress * 0.22; // max 1.22

            this.squashGroup.scale.set(scaleXZ, scaleY, scaleXZ);

            // Keep base anchored to the block surface
            const baseDip = (1.0 - scaleY) * 0.05;
            this.squashGroup.position.y = -baseDip;

            // Compress current block slightly as well
            if (currentBlock && currentBlock.setDip) {
                currentBlock.setDip(progress * 0.08);
            }
        } else if (this.state === 'JUMPING') {
            this.jumpProgress += deltaTime / this.jumpDuration;

            if (this.jumpProgress >= 1.0) {
                this.jumpProgress = 1.0;
                // Will be handled by landing callback in game.js
            }

            const p = this.jumpProgress;
            // Linear horizontal interpolation
            this.group.position.x = this.jumpStart.x + (this.jumpEnd.x - this.jumpStart.x) * p;
            this.group.position.z = this.jumpStart.z + (this.jumpEnd.z - this.jumpStart.z) * p;

            // Parabolic vertical arc
            const baseY = this.jumpStart.y;
            const parabola = 4 * this.jumpHeight * p * (1 - p);
            this.group.position.y = baseY + parabola;

            // 360 somersault flip
            const angle = p * Math.PI * 2;
            this.rotationGroup.setRotationFromAxisAngle(this.jumpAxis, angle);

            // Mid-air stretch
            const midStretch = 1.0 + Math.sin(p * Math.PI) * 0.16;
            const midSquashXZ = 1.0 / Math.sqrt(midStretch);
            this.squashGroup.scale.set(midSquashXZ, midStretch, midSquashXZ);
            this.squashGroup.position.y = 0;

            // Shadow tracking on ground/block level
            this.shadowMesh.position.x = this.group.position.x;
            this.shadowMesh.position.z = this.group.position.z;
            this.shadowMesh.position.y = baseY + 0.01;
            // Shadow shrinks and fades as piece flies higher
            const shadowScale = Math.max(0.35, 1.0 - parabola * 0.18);
            this.shadowMesh.scale.set(shadowScale, shadowScale, 1.0);
            this.shadowMesh.material.opacity = Math.max(0.1, 0.45 - parabola * 0.08);

        } else if (this.state === 'SETTLING') {
            this.settleTime += deltaTime;
            // Damped spring settling bounce
            const freq = 28;
            const decay = 12;
            const bounce = Math.sin(this.settleTime * freq) * Math.exp(-this.settleTime * decay);

            const scaleY = 1.0 - bounce * 0.22;
            const scaleXZ = 1.0 + bounce * 0.11;
            this.squashGroup.scale.set(scaleXZ, scaleY, scaleXZ);

            if (this.settleTime > 0.35) {
                this.squashGroup.scale.set(1, 1, 1);
                this.state = 'IDLE';
            }
        } else if (this.state === 'FALLING') {
            this.fallVelocity += 28 * deltaTime;
            this.group.position.y -= this.fallVelocity * deltaTime;

            // Tumble tilt
            this.fallAngle += 4.5 * deltaTime;
            this.rotationGroup.setRotationFromAxisAngle(this.fallAxis, this.fallAngle);

            // Shadow fades out completely
            this.shadowMesh.material.opacity = Math.max(0, this.shadowMesh.material.opacity - deltaTime * 2);
        }
    }

    /**
     * Trigger safe landing on block
     */
    landOnBlock(y) {
        this.state = 'SETTLING';
        this.settleTime = 0;
        this.rotationGroup.rotation.set(0, 0, 0);
        this.group.position.y = y;
        this.shadowMesh.position.y = y + 0.01;
        this.shadowMesh.scale.set(1, 1, 1);
        this.shadowMesh.material.opacity = 0.45;
    }

    /**
     * Trigger tumble fall off edge
     */
    startFalling(fallAxis) {
        this.state = 'FALLING';
        this.fallVelocity = 0;
        this.fallAngle = 0;
        this.fallAxis.copy(fallAxis);
    }

    reset() {
        this.state = 'IDLE';
        this.chargeTime = 0;
        this.rotationGroup.rotation.set(0, 0, 0);
        this.squashGroup.scale.set(1, 1, 1);
        this.squashGroup.position.set(0, 0, 0);
        this.shadowMesh.scale.set(1, 1, 1);
        this.shadowMesh.material.opacity = 0.45;
    }
}
