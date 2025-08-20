//==========================================================================
// EliMZ_JumpSystem_DotMovePatch.js
//==========================================================================

/*:
@target MZ
@base EliMZ_JumpSystem
@orderAfter EliMZ_JumpSystem

@plugindesc ♦5.0.1♦ Dot Move System (unagi ootoro) Compatibility patch.
@author Hakuen Studio
@url https://hakuenstudio.itch.io/eli-jump-system-for-rpg-maker-mv

@help
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
If you like my work, please consider supporting me on Patreon!
Patreon      → https://www.patreon.com/hakuenstudio
Terms of Use → https://www.hakuenstudio.com/terms-of-use-5-0-0
*** Follow the terms of unagi ootoro too! ***
Facebook     → https://www.facebook.com/hakuenstudio
Instagram    → https://www.instagram.com/hakuenstudio
Twitter      → https://twitter.com/hakuen_studio
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
============================================================================
Features
============================================================================

● Compatibility patch that let EliMZ Jump System and Dot Move System from 
unagi ootoro, Pixel Movement plugin work together.

============================================================================
How to use
============================================================================

Download Dot Move System:
https://raw.githubusercontent.com/unagiootoro/RPGMZ/master/DotMoveSystem.js
https://raw.githubusercontent.com/unagiootoro/RPGMZ/master/DotMoveSystem_FunctionEx.js

Dot Move System must be above EliMZ_Book.
This plugin must be below EliMZ_JumpSystem.

It's Plug and Play.

============================================================================

*/

"use strict"

var Eli = Eli || {}
var Imported = Imported || {}
Imported.Eli_JumpSystem_DotMovePatch = true

/* ========================================================================== */
/*                                   PLUGIN                                   */
/* ========================================================================== */

{

Eli.JumpSystem_DotMovePatch = {

    version: 5.01,
    url: "",
    parameters: {},
    alias: {},

    initialize(){
        this.initParameters()
        this.initPluginCommands()
    },

    initParameters(){},

    initPluginCommands(){},

    param(){
        return this.parameters
    },
    
}

const Plugin = Eli.JumpSystem_DotMovePatch
const Alias = Eli.JumpSystem_DotMovePatch.alias
const DotMoveSystem = $plugins.some(item => item.name === "DotMoveSystem" && item.status)
const DotMoveSystem_FunctionEx = $plugins.some(item => item.name === "DotMoveSystem_FunctionEx" && item.status)

if(DotMoveSystem){

Alias.Game_Player_moveByInput = Game_Player.prototype.moveByInput
Game_Player.prototype.moveByInput = function() {
    if(this.isJumping()) return
    Alias.Game_Player_moveByInput.call(this)
}

/*
The function isMoving do not return true if Game_Player is moving by input.
So, I believe you need to add to it the "this.isMoved()" too.
*/

Alias.Game_Player_isMoving = Game_Player.prototype.isMoving
Game_Player.prototype.isMoving = function() {
    return Alias.Game_Player_isMoving.call(this) || this.isMoved()//&& (this.getInputDirection() > 0)
}

    if(DotMoveSystem_FunctionEx){

    Game_CharacterBase.prototype.isSmartJumping = function() {
        return false
    }

    }

}



}