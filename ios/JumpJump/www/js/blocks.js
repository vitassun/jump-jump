/**
 * JumpJump Block System - Diverse, beautiful, tactile isometric blocks
 */

class BlockManager {
    constructor(scene) {
        this.scene = scene;
        this.blocks = [];
        this.blockHeight = 2.0;

        // Shared reusable materials & canvas textures
        this.initCanvasTextures();
    }

    initCanvasTextures() {
        // Express label texture
        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 128;
        labelCanvas.height = 128;
        const lctx = labelCanvas.getContext('2d');
        lctx.fillStyle = '#ffffff';
        lctx.fillRect(0, 0, 128, 128);
        lctx.fillStyle = '#111111';
        // Barcode lines
        lctx.fillRect(16, 20, 96, 8);
        for (let x = 18; x < 110; x += 6) {
            lctx.fillRect(x, 40, (x % 12 === 0 ? 4 : 2), 48);
        }
        lctx.font = 'bold 16px sans-serif';
        lctx.fillText('SF-EXPRESS', 16, 110);
        this.expressTexture = new THREE.CanvasTexture(labelCanvas);

        // Clock dial texture
        const clockCanvas = document.createElement('canvas');
        clockCanvas.width = 256;
        clockCanvas.height = 256;
        const cctx = clockCanvas.getContext('2d');
        cctx.fillStyle = '#FFF8E1';
        cctx.fillRect(0, 0, 256, 256);
        cctx.strokeStyle = '#D7CCC8';
        cctx.lineWidth = 6;
        cctx.beginPath();
        cctx.arc(128, 128, 110, 0, Math.PI * 2);
        cctx.stroke();
        // 12 hour ticks
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * Math.PI / 180;
            const x1 = 128 + Math.cos(angle) * 88;
            const y1 = 128 + Math.sin(angle) * 88;
            const x2 = 128 + Math.cos(angle) * 102;
            const y2 = 128 + Math.sin(angle) * 102;
            cctx.beginPath();
            cctx.moveTo(x1, y1);
            cctx.lineTo(x2, y2);
            cctx.lineWidth = (i % 3 === 0 ? 8 : 4);
            cctx.strokeStyle = '#5D4037';
            cctx.stroke();
        }
        // Hands (10:10)
        cctx.lineWidth = 8;
        cctx.beginPath();
        cctx.moveTo(128, 128);
        cctx.lineTo(128 + Math.cos(-Math.PI / 6 * 4) * 55, 128 + Math.sin(-Math.PI / 6 * 4) * 55);
        cctx.stroke();
        cctx.lineWidth = 5;
        cctx.beginPath();
        cctx.moveTo(128, 128);
        cctx.lineTo(128 + Math.cos(-Math.PI / 6 * 1) * 80, 128 + Math.sin(-Math.PI / 6 * 1) * 80);
        cctx.stroke();
        // Center pin
        cctx.fillStyle = '#FF5722';
        cctx.beginPath();
        cctx.arc(128, 128, 10, 0, Math.PI * 2);
        cctx.fill();
        this.clockTexture = new THREE.CanvasTexture(clockCanvas);

        // Vinyl Record texture
        const vinylCanvas = document.createElement('canvas');
        vinylCanvas.width = 256;
        vinylCanvas.height = 256;
        const vctx = vinylCanvas.getContext('2d');
        vctx.fillStyle = '#1c1c1f';
        vctx.fillRect(0, 0, 256, 256);
        // Grooves
        vctx.strokeStyle = '#2c2c30';
        vctx.lineWidth = 2;
        for (let r = 50; r < 120; r += 6) {
            vctx.beginPath();
            vctx.arc(128, 128, r, 0, Math.PI * 2);
            vctx.stroke();
        }
        // Center label (red vinyl label)
        vctx.fillStyle = '#E53935';
        vctx.beginPath();
        vctx.arc(128, 128, 45, 0, Math.PI * 2);
        vctx.fill();
        vctx.fillStyle = '#FDD835';
        vctx.beginPath();
        vctx.arc(128, 128, 20, 0, Math.PI * 2);
        vctx.fill();
        // Spindle hole
        vctx.fillStyle = '#ffffff';
        vctx.beginPath();
        vctx.arc(128, 128, 8, 0, Math.PI * 2);
        vctx.fill();
        this.vinylTexture = new THREE.CanvasTexture(vinylCanvas);
    }

    /**
     * Spawn a block at given (x, z)
     */
    createBlock(x, z, styleIndex = null) {
        const styles = [
            'cylinder_slate',
            'box_mint',
            'express_box',
            'rubiks_cube',
            'vinyl_turntable',
            'convenience_store',
            'clock_block',
            'cylinder_pastel',
            'box_peach'
        ];

        const type = styleIndex !== null && styleIndex >= 0 && styleIndex < styles.length
            ? styles[styleIndex]
            : styles[Math.floor(Math.random() * styles.length)];

        let blockObj;
        switch (type) {
            case 'cylinder_slate':
                blockObj = this.buildCylinderBlock(1.22, '#cfd8dc', '#ffffff', '#b0bec5');
                break;
            case 'cylinder_pastel':
                blockObj = this.buildCylinderBlock(1.18, '#ffcdd2', '#ffffff', '#e57373');
                break;
            case 'box_mint':
                blockObj = this.buildBoxBlock(2.35, 2.35, '#80cbc4', '#ffffff', '#4db6ac');
                break;
            case 'box_peach':
                blockObj = this.buildBoxBlock(2.35, 2.35, '#ffccbc', '#ffffff', '#ffab91');
                break;
            case 'express_box':
                blockObj = this.buildExpressBox();
                break;
            case 'rubiks_cube':
                blockObj = this.buildRubiksCube();
                break;
            case 'vinyl_turntable':
                blockObj = this.buildVinylTurntable();
                break;
            case 'convenience_store':
                blockObj = this.buildConvenienceStore();
                break;
            case 'clock_block':
                blockObj = this.buildClockBlock();
                break;
            default:
                blockObj = this.buildCylinderBlock(1.2, '#cfd8dc', '#ffffff', '#90a4ae');
        }

        blockObj.group.position.set(x, 0, z);
        this.scene.add(blockObj.group);

        const block = {
            group: blockObj.group,
            mesh: blockObj.mainMesh,
            type: blockObj.type,
            radius: blockObj.radius,
            topY: this.blockHeight,
            x: x,
            z: z,
            initialY: 0,
            dipOffset: 0,
            spawnYOffset: 5.0,
            spawnProgress: 0,
            isSpawning: true,

            // Animate compression during player charge
            setDip: (amount) => {
                // scaleY dips from 1.0 down to (1.0 - amount)
                const scale = Math.max(0.78, 1.0 - amount);
                blockObj.group.scale.y = scale;
                // keep bottom grounded
                blockObj.group.position.y = -(1.0 - scale) * (this.blockHeight * 0.5);
            },
            resetDip: () => {
                blockObj.group.scale.y = 1.0;
                blockObj.group.position.y = 0;
            },
            dispose: () => {
                this.scene.remove(blockObj.group);
                blockObj.group.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
        };

        this.blocks.push(block);
        return block;
    }

    /**
     * Cylinder Block
     */
    buildCylinderBlock(radius, bodyColor, topColor, accentColor) {
        const group = new THREE.Group();
        const height = this.blockHeight;

        // Cylinder body
        const cylGeom = new THREE.CylinderGeometry(radius, radius, height, 36);
        const cylMat = new THREE.MeshLambertMaterial({ color: bodyColor });
        const cylMesh = new THREE.Mesh(cylGeom, cylMat);
        cylMesh.position.y = height / 2;
        cylMesh.castShadow = true;
        cylMesh.receiveShadow = true;
        group.add(cylMesh);

        // Top surface cap with concentric rings
        const ringGeom = new THREE.RingGeometry(radius * 0.45, radius * 0.52, 36);
        const ringMat = new THREE.MeshBasicMaterial({ color: accentColor, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = height + 0.002;
        group.add(ringMesh);

        // Center dot
        const dotGeom = new THREE.CircleGeometry(0.24, 32);
        const dotMat = new THREE.MeshBasicMaterial({ color: topColor, side: THREE.DoubleSide });
        const dotMesh = new THREE.Mesh(dotGeom, dotMat);
        dotMesh.rotation.x = -Math.PI / 2;
        dotMesh.position.y = height + 0.003;
        group.add(dotMesh);

        return { group, mainMesh: cylMesh, type: 'cylinder', radius };
    }

    /**
     * Box Block
     */
    buildBoxBlock(width, depth, bodyColor, topColor, accentColor) {
        const group = new THREE.Group();
        const height = this.blockHeight;

        const boxGeom = new THREE.BoxGeometry(width, height, depth);
        const boxMat = new THREE.MeshLambertMaterial({ color: bodyColor });
        const boxMesh = new THREE.Mesh(boxGeom, boxMat);
        boxMesh.position.y = height / 2;
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        group.add(boxMesh);

        // Center marker
        const dotGeom = new THREE.CircleGeometry(0.28, 32);
        const dotMat = new THREE.MeshBasicMaterial({ color: topColor, side: THREE.DoubleSide });
        const dotMesh = new THREE.Mesh(dotGeom, dotMat);
        dotMesh.rotation.x = -Math.PI / 2;
        dotMesh.position.y = height + 0.002;
        group.add(dotMesh);

        // Subtle outer border ring
        const ringGeom = new THREE.RingGeometry(0.55, 0.62, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: accentColor, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = height + 0.002;
        group.add(ringMesh);

        return { group, mainMesh: boxMesh, type: 'box', radius: width * 0.58 };
    }

    /**
     * Classic Express Box (快递包裹)
     */
    buildExpressBox() {
        const group = new THREE.Group();
        const width = 2.4, depth = 2.4, height = this.blockHeight;

        // Cardboard box body
        const boxGeom = new THREE.BoxGeometry(width, height, depth);
        const boxMat = new THREE.MeshLambertMaterial({ color: '#cca472' });
        const boxMesh = new THREE.Mesh(boxGeom, boxMat);
        boxMesh.position.y = height / 2;
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        group.add(boxMesh);

        // Packaging Tape cross
        const tapeMat = new THREE.MeshLambertMaterial({ color: '#b28755' });
        // Tape across top & sides X
        const tapeGeom1 = new THREE.BoxGeometry(width + 0.01, height + 0.01, 0.42);
        const tapeMesh1 = new THREE.Mesh(tapeGeom1, tapeMat);
        tapeMesh1.position.y = height / 2;
        group.add(tapeMesh1);

        // Express shipping label sticker
        const labelGeom = new THREE.PlaneGeometry(0.9, 0.9);
        const labelMat = new THREE.MeshBasicMaterial({ map: this.expressTexture, side: THREE.DoubleSide });
        const labelMesh = new THREE.Mesh(labelGeom, labelMat);
        labelMesh.rotation.x = -Math.PI / 2;
        labelMesh.position.set(0.4, height + 0.004, -0.4);
        group.add(labelMesh);

        // Center dot
        const dotGeom = new THREE.CircleGeometry(0.24, 32);
        const dotMat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide });
        const dotMesh = new THREE.Mesh(dotGeom, dotMat);
        dotMesh.rotation.x = -Math.PI / 2;
        dotMesh.position.y = height + 0.005;
        group.add(dotMesh);

        return { group, mainMesh: boxMesh, type: 'box', radius: width * 0.58 };
    }

    /**
     * Rubik's Cube Block (魔方)
     */
    buildRubiksCube() {
        const group = new THREE.Group();
        const size = 2.3, height = this.blockHeight;

        // Black core cube
        const coreGeom = new THREE.BoxGeometry(size, height, size);
        const coreMat = new THREE.MeshLambertMaterial({ color: '#1c1c1f' });
        const coreMesh = new THREE.Mesh(coreGeom, coreMat);
        coreMesh.position.y = height / 2;
        coreMesh.castShadow = true;
        coreMesh.receiveShadow = true;
        group.add(coreMesh);

        // 3x3 colored grid face on top
        const tileColors = [
            '#e53935', '#fdd835', '#1e88e5',
            '#43a047', '#fb8c00', '#ffffff',
            '#1e88e5', '#43a047', '#fdd835'
        ];
        const tileSize = 0.65;
        const gap = 0.08;
        const offset = (size - gap * 2 - tileSize * 3) / 2;

        let idx = 0;
        for (let row = -1; row <= 1; row++) {
            for (let col = -1; col <= 1; col++) {
                const tileGeom = new THREE.PlaneGeometry(tileSize, tileSize);
                const tileMat = new THREE.MeshLambertMaterial({ color: tileColors[idx % tileColors.length] });
                const tileMesh = new THREE.Mesh(tileGeom, tileMat);
                tileMesh.rotation.x = -Math.PI / 2;
                tileMesh.position.set(col * (tileSize + gap), height + 0.003, row * (tileSize + gap));
                group.add(tileMesh);
                idx++;
            }
        }

        // Center target ring
        const dotGeom = new THREE.CircleGeometry(0.2, 32);
        const dotMat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide });
        const dotMesh = new THREE.Mesh(dotGeom, dotMat);
        dotMesh.rotation.x = -Math.PI / 2;
        dotMesh.position.y = height + 0.006;
        group.add(dotMesh);

        return { group, mainMesh: coreMesh, type: 'box', radius: size * 0.58 };
    }

    /**
     * Vinyl Turntable (黑胶唱片机)
     */
    buildVinylTurntable() {
        const group = new THREE.Group();
        const width = 2.4, depth = 2.4, height = this.blockHeight;

        // Wood cabinet
        const baseGeom = new THREE.BoxGeometry(width, height, depth);
        const baseMat = new THREE.MeshLambertMaterial({ color: '#423730' });
        const baseMesh = new THREE.Mesh(baseGeom, baseMat);
        baseMesh.position.y = height / 2;
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        group.add(baseMesh);

        // Turntable circular vinyl platter
        const vinylGeom = new THREE.CircleGeometry(1.05, 36);
        const vinylMat = new THREE.MeshLambertMaterial({ map: this.vinylTexture, side: THREE.DoubleSide });
        const vinylMesh = new THREE.Mesh(vinylGeom, vinylMat);
        vinylMesh.rotation.x = -Math.PI / 2;
        vinylMesh.position.set(0, height + 0.003, 0);
        group.add(vinylMesh);

        // Tone-arm metallic bar
        const armGeom = new THREE.BoxGeometry(0.08, 0.08, 0.85);
        const armMat = new THREE.MeshLambertMaterial({ color: '#cfd8dc' });
        const armMesh = new THREE.Mesh(armGeom, armMat);
        armMesh.rotation.y = 0.4;
        armMesh.position.set(0.85, height + 0.08, 0.4);
        group.add(armMesh);

        return { group, mainMesh: baseMesh, type: 'box', radius: width * 0.58 };
    }

    /**
     * Convenience Store (便利店)
     */
    buildConvenienceStore() {
        const group = new THREE.Group();
        const width = 2.4, depth = 2.4, height = this.blockHeight;

        // Store body
        const storeGeom = new THREE.BoxGeometry(width, height, depth);
        const storeMat = new THREE.MeshLambertMaterial({ color: '#f5f5f5' });
        const storeMesh = new THREE.Mesh(storeGeom, storeMat);
        storeMesh.position.y = height / 2;
        storeMesh.castShadow = true;
        storeMesh.receiveShadow = true;
        group.add(storeMesh);

        // Storefront awning stripes (Green, Orange, Green)
        const stripeColors = ['#00897b', '#ff9800', '#00897b'];
        for (let i = 0; i < 3; i++) {
            const stripeGeom = new THREE.BoxGeometry(width + 0.02, 0.12, 0.28);
            const stripeMat = new THREE.MeshLambertMaterial({ color: stripeColors[i] });
            const stripeMesh = new THREE.Mesh(stripeGeom, stripeMat);
            stripeMesh.position.set(0, height - 0.1 - i * 0.13, depth / 2 + 0.01);
            group.add(stripeMesh);
        }

        // Center dot
        const dotGeom = new THREE.CircleGeometry(0.26, 32);
        const dotMat = new THREE.MeshBasicMaterial({ color: '#00897b', side: THREE.DoubleSide });
        const dotMesh = new THREE.Mesh(dotGeom, dotMat);
        dotMesh.rotation.x = -Math.PI / 2;
        dotMesh.position.y = height + 0.003;
        group.add(dotMesh);

        return { group, mainMesh: storeMesh, type: 'box', radius: width * 0.58 };
    }

    /**
     * Alarm Clock Block
     */
    buildClockBlock() {
        const group = new THREE.Group();
        const radius = 1.25, height = this.blockHeight;

        // Pastel yellow cylinder body
        const cylGeom = new THREE.CylinderGeometry(radius, radius, height, 36);
        const cylMat = new THREE.MeshLambertMaterial({ color: '#fff9c4' });
        const cylMesh = new THREE.Mesh(cylGeom, cylMat);
        cylMesh.position.y = height / 2;
        cylMesh.castShadow = true;
        cylMesh.receiveShadow = true;
        group.add(cylMesh);

        // Clock top face dial
        const dialGeom = new THREE.CircleGeometry(radius * 0.94, 36);
        const dialMat = new THREE.MeshLambertMaterial({ map: this.clockTexture, side: THREE.DoubleSide });
        const dialMesh = new THREE.Mesh(dialGeom, dialMat);
        dialMesh.rotation.x = -Math.PI / 2;
        dialMesh.position.y = height + 0.003;
        group.add(dialMesh);

        return { group, mainMesh: cylMesh, type: 'cylinder', radius };
    }

    /**
     * Update blocks animation (spawn drop & spring bounce)
     */
    update(deltaTime) {
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const b = this.blocks[i];
            if (b.isSpawning) {
                b.spawnProgress += deltaTime * 4.5;
                if (b.spawnProgress >= 1.0) {
                    b.spawnProgress = 1.0;
                    b.isSpawning = false;
                    b.group.position.y = b.initialY;
                } else {
                    // Elastic ease-out bounce
                    const p = b.spawnProgress;
                    const bounce = Math.sin(p * Math.PI * 1.5) * (1 - p) * 0.8;
                    const easeOut = 1 - Math.pow(1 - p, 3);
                    b.group.position.y = b.initialY + (1 - easeOut) * b.spawnYOffset + bounce;
                }
            }
        }
    }

    /**
     * Remove old blocks that are behind the player to maintain high FPS
     */
    cleanOldBlocks(keepCount = 6) {
        while (this.blocks.length > keepCount) {
            const oldBlock = this.blocks.shift();
            oldBlock.dispose();
        }
    }

    /**
     * Reset all blocks
     */
    reset() {
        for (const b of this.blocks) {
            b.dispose();
        }
        this.blocks = [];
    }
}
