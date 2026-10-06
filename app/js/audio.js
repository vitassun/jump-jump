/**
 * JumpJump Audio Engine - 100% Offline Procedural Web Audio API Synthesizer
 * Custom tuned to replicate WeChat Jump's iconic sound effects and iOS haptics
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.unlocked = false;
        this.chargeOsc = null;
        this.chargeGain = null;
        this.chargeLFO = null;
        this.isCharging = false;
        
        // Pentatonic / major scale notes for combo chimes (Hz)
        this.comboFrequencies = [
            523.25, // C5
            587.33, // D5
            659.25, // E5
            783.99, // G5
            880.00, // A5
            1046.50,// C6
            1174.66,// D6
            1318.51,// E6
            1567.98 // G6
        ];
    }

    init() {
        if (this.unlocked && this.ctx) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            if (!this.ctx) {
                this.ctx = new AudioCtx();
            }
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            // Unlock iOS Safari audio by playing a silent micro-buffer
            const buffer = this.ctx.createBuffer(1, 1, 22050);
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(this.ctx.destination);
            source.start(0);

            this.unlocked = true;
        } catch (e) {
            console.warn('AudioContext init failed:', e);
        }
    }

    /**
     * Start continuous charging hum
     */
    startCharge() {
        this.init();
        if (!this.ctx) return;
        this.stopCharge();

        const now = this.ctx.currentTime;
        this.isCharging = true;

        // Base oscillator (rising pitch)
        this.chargeOsc = this.ctx.createOscillator();
        this.chargeOsc.type = 'triangle';
        this.chargeOsc.frequency.setValueAtTime(200, now);
        this.chargeOsc.frequency.exponentialRampToValueAtTime(540, now + 1.8);

        // Sub harmonic oscillator for warm body
        this.chargeSub = this.ctx.createOscillator();
        this.chargeSub.type = 'sine';
        this.chargeSub.frequency.setValueAtTime(100, now);
        this.chargeSub.frequency.exponentialRampToValueAtTime(270, now + 1.8);

        // Master gain for charge
        this.chargeGain = this.ctx.createGain();
        this.chargeGain.gain.setValueAtTime(0.001, now);
        this.chargeGain.gain.linearRampToValueAtTime(0.22, now + 0.08);

        // Tremolo / LFO to create tension pulsation
        this.chargeLFO = this.ctx.createOscillator();
        this.chargeLFO.frequency.setValueAtTime(8, now);
        this.chargeLFO.frequency.linearRampToValueAtTime(16, now + 1.8);

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(0.06, now);

        this.chargeLFO.connect(lfoGain);
        lfoGain.connect(this.chargeGain.gain);

        this.chargeOsc.connect(this.chargeGain);
        this.chargeSub.connect(this.chargeGain);
        this.chargeGain.connect(this.ctx.destination);

        this.chargeOsc.start(now);
        this.chargeSub.start(now);
        this.chargeLFO.start(now);

        this.triggerHaptic('light');
    }

    /**
     * Stop charging hum
     */
    stopCharge() {
        if (!this.ctx || !this.isCharging) return;
        this.isCharging = false;
        const now = this.ctx.currentTime;

        if (this.chargeGain) {
            try {
                this.chargeGain.gain.cancelScheduledValues(now);
                this.chargeGain.gain.setValueAtTime(this.chargeGain.gain.value, now);
                this.chargeGain.gain.linearRampToValueAtTime(0.0001, now + 0.04);
            } catch (e) {}
        }

        setTimeout(() => {
            try {
                if (this.chargeOsc) { this.chargeOsc.stop(); this.chargeOsc.disconnect(); this.chargeOsc = null; }
                if (this.chargeSub) { this.chargeSub.stop(); this.chargeSub.disconnect(); this.chargeSub = null; }
                if (this.chargeLFO) { this.chargeLFO.stop(); this.chargeLFO.disconnect(); this.chargeLFO = null; }
                this.chargeGain = null;
            } catch (e) {}
        }, 50);
    }

    /**
     * Jump spring release sound
     */
    playJump() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);

        this.triggerHaptic('medium');
    }

    /**
     * Solid landing thud
     */
    playLand() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Low pop tone
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(170, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.1);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);

        this.triggerHaptic('light');
    }

    /**
     * Center hit combo chime (rich musical bell / marimba)
     * @param {number} streak 1-indexed combo streak
     */
    playCombo(streak = 1) {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const noteIndex = Math.min(streak - 1, this.comboFrequencies.length - 1);
        const baseFreq = this.comboFrequencies[noteIndex];

        // Fundamental bell oscillator
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, now);

        // Sparkle harmonic overtone
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(baseFreq * 2.756, now);

        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.56);
        osc2.stop(now + 0.56);

        this.triggerHaptic('success');
    }

    /**
     * Fall / Game Over sound
     */
    playFall() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.45);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.5);

        this.triggerHaptic('error');
    }

    /**
     * iOS Haptic Feedback via native WKScriptMessageHandler or Web Vibration API
     */
    triggerHaptic(type = 'light') {
        try {
            // Native iOS WKWebView bridge
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptic) {
                window.webkit.messageHandlers.haptic.postMessage({ type: type });
                return;
            }

            // Web standard vibration fallback
            if (navigator.vibrate) {
                switch (type) {
                    case 'light': navigator.vibrate(10); break;
                    case 'medium': navigator.vibrate(25); break;
                    case 'heavy': navigator.vibrate(45); break;
                    case 'success': navigator.vibrate([15, 30, 25]); break;
                    case 'error': navigator.vibrate([40, 40, 50]); break;
                }
            }
        } catch (e) {}
    }
}

window.soundEngine = new SoundEngine();
