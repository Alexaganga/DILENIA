/*:
 * @target MZ
 * @plugindesc Adds a floating animation to enemies with the <floating> notetag. v1.0
 * 
 * @help
 * ============================================================================
 * Floating Enemies Plugin v1.0
 * ============================================================================
 * This plugin makes enemies float in battle when they have the following
 * notetag in their database entry:
 * 
 * <floating>
 * 
 * The animation is a subtle up-and-down motion.
 * 
 * ============================================================================
 * Terms of Use:
 * - Free for commercial and non-commercial use.
 * - No credit required, but appreciated.
 * ============================================================================
 */

(() => {

    const FLOAT_TAG = "<floating>";
    const FLOAT_AMPLITUDE = 5; // pixels
    const FLOAT_SPEED = 0.05;  // radians per frame

    const _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
    Sprite_Enemy.prototype.update = function() {
        _Sprite_Enemy_update.call(this);

        if (this._enemy && this._enemy.enemy()) {
            if (this._enemy.enemy().note.includes(FLOAT_TAG)) {
                this._floatCounter = this._floatCounter || 0;
                this._floatCounter += FLOAT_SPEED;
                this.y += Math.sin(this._floatCounter) * FLOAT_AMPLITUDE;
            }
        }
    };

})();
