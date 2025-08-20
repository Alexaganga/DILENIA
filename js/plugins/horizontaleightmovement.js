/*:
 * @target MZ
 * @plugindesc Horizontal 8 + Shake + Smooth Pushback to the left on hit. v1.5 🌀↔️💥🛷 Deslizamiento real al ser golpeado (notetag configurable) by ChatGPT
 * @author
 * @help
 * Notetags disponibles (en la caja de notas del enemigo):
 *
 * <horizontal8>
 * <horizontal8Speed: 0.03>
 * <horizontal8X: 6>
 * <horizontal8Y: 3>
 *
 * <shakePower: 5>
 * <shakeDuration: 20>
 *
 * <pushBackDistance: 20>
 * <pushBackDuration: 10>
 */

(() => {

    function getTagValue(note, tag, defaultValue) {
        const match = note.match(new RegExp(`<${tag}:[ ]*(.+?)>`, "i"));
        return match ? Number(match[1]) : defaultValue;
    }

    const _initMembers = Sprite_Battler.prototype.initMembers;
    const _setBattler = Sprite_Enemy.prototype.setBattler;
    const _updatePosition = Sprite_Battler.prototype.updatePosition;
    const _createDamageSprite = Sprite_Battler.prototype.createDamageSprite;

    Sprite_Battler.prototype.initMembers = function () {
        _initMembers.call(this);
        this._shakeDur = 0;
        this._shakePower = 7;
        this._shakeMaxDur = 30;

        this._pushBackDur = 0;
        this._pushBackMaxDur = 10;
        this._pushBackDistance = 20;

        this._h8Data = {
            enabled: false,
            counter: 0,
            originX: 0,
            originY: 0,
            initialized: false,
            ampX: 4,
            ampY: 2,
            speed: 0.02
        };
    };

    Sprite_Enemy.prototype.setBattler = function (battler) {
        _setBattler.call(this, battler);
        if (battler && battler.enemy()) {
            const note = battler.enemy().note;

            // Movimiento en 8
            this._h8Data.enabled = note.includes("<horizontal8>");
            this._h8Data.ampX = getTagValue(note, "horizontal8X", 4);
            this._h8Data.ampY = getTagValue(note, "horizontal8Y", 2);
            this._h8Data.speed = getTagValue(note, "horizontal8Speed", 0.02);

            // Sacudida
            this._shakePower = getTagValue(note, "shakePower", 7);
            this._shakeMaxDur = getTagValue(note, "shakeDuration", 30);

            // Empuje
            this._pushBackDistance = getTagValue(note, "pushBackDistance", 20);
            this._pushBackMaxDur = getTagValue(note, "pushBackDuration", 10);
        }
    };

    Sprite_Battler.prototype.updatePosition = function () {
        _updatePosition.call(this);

        let dx = 0, dy = 0;

        // Movimiento horizontal 8
        if (this._h8Data?.enabled) {
            if (!this._h8Data.initialized) {
                this._h8Data.originX = this.x;
                this._h8Data.originY = this.y;
                this._h8Data.initialized = true;
            }

            this._h8Data.counter += this._h8Data.speed;
            const t = this._h8Data.counter;

            dx += this._h8Data.ampX * Math.sin(t);
            dy += this._h8Data.ampY * Math.sin(t) * Math.cos(t);

            this.x = this._h8Data.originX + dx;
            this.y = this._h8Data.originY + dy;
        }

        // Sacudida
        if (this._shakeDur > 0) {
            const rate = this._shakeDur / this._shakeMaxDur;
            this.x += Math.random() * this._shakePower * rate * (Math.random() >= 0.5 ? 1 : -1);
            this.y += Math.random() * this._shakePower * rate * (Math.random() >= 0.5 ? 1 : -1);
            this._shakeDur -= 1;
        }

        // Deslizamiento pushback (solo en X)
        if (this._pushBackDur > 0) {
            const total = this._pushBackMaxDur;
            const t = total - this._pushBackDur;
            const progress = t / total;

            // Ease out and in (senoide)
            const offset = Math.sin(progress * Math.PI) * this._pushBackDistance;

            this.x -= offset;

            this._pushBackDur--;
        }
    };

    Sprite_Battler.prototype.createDamageSprite = function () {
        _createDamageSprite.call(this);
        const res = this._battler?.result?.();
        if (res?.isHit?.() && (res.hpDamage > 0 || res.mpDamage > 0 || res.tpDamage > 0 || res.isStatusAffected())) {
            this._shakeDur = this._shakeMaxDur;
            this._pushBackDur = this._pushBackMaxDur;
        }
    };

})();