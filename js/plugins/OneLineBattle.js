//=============================================================================
// OneLineBattleMessage.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Displays the Battle Log as a one-line battle message.
 * @author N/A (open-source, copyleft)
 *
 * @help OneLineBattleMessage.js
 *
 * This plugin displays the Battle Log as a one-line battle message at the
 * top window.  The window and the font that are used for the Battle Log
 * Window can be customized through the BL Window Properties and the BL Font
 * Properties.
 *
 * This plugin does not provide plugin commands.
 *
 * The following is about the parameters that are found in the Font Properties
 * structure:
 *
 * About Font Filename - The Font Filename is for the main font file that will
 * be used for the text.  The main font file must be located at the fonts
 * folder of the game project.  The filename of the font file must include the
 * format type (for example, Times.ttf).  If Font Filename is left blank, then
 * the Fallback Font (which is identified through Fallback Font Name) will be
 * used for the text.
 *
 * About Fallback Font Name - If Fallback Font Name is left blank, then Verdana
 * will be used as the Fallback Font.
 *
 * About Text Color Index - The Text Color Index uses the Message Window color
 * index for the text color.  The color index can be obtained by going through
 * the following steps:
 * 1. Go to Show Text on Event Commands
 * 2. Right-click on the Text space to open Show Text menu
 * 3. Choose Insert Color Index
 * 4. Pick the color choice for the text and press OK
 * 5. Write down the number, which is the color index for that color choice
 * 6. Use that number for the Text Color Index on Font Properties
 *
 * About Outline Color - The Outline Color can be typed as either a color name
 * or a hex code and the names as well as the hex codes for the colors can be
 * found on documentations about javascript.  For the hex code, the number
 * sign (#) must be included in front of the hex code (for example, #ffffffff).
 * In order to not have an outline around the text, the word "transparent" can
 * be used instead of either the color name or the hex code.
 *
 * @param battleLogWindow
 * @type struct<windowProperties>
 * @default {"windowName":"Window","windowBackground":"0","windowPlacement":"0","windowBackOpacity":"192"}
 * @text BL Window Properties
 * @desc Window properties for the Battle Log Window
 *
 * @param battleLogFont
 * @type struct<fontProperties>
 * @default {"fontFile":"mplus-1m-regular.woff","fontName":"Verdana","fontSize":"26","fontBold":"false","fontItalic":"false","textColorIndex":"0","outlineColor":"transparent"}
 * @text BL Font Properties
 * @desc Font properties for the Battle Log text
 *
 * @param textAlignment
 * @type select
 * @option Center
 * @value center
 * @option Left
 * @value left
 * @default center
 * @text Text Alignment
 * @desc Alignment of the text within the window
 *
 * @param messageSpeed
 * @type number
 * @min 0
 * @max 30
 * @default 16
 * @text Message Speed
 * @desc Message Speed value (0 - 30)
 *
 * @param constantOpenness
 * @type boolean
 * @on On
 * @off Off
 * @default false
 * @text Constant Window Openness
 * @desc Turn on/off constant openness for battle message window.  This works only during the battle turn.
 */

/*~struct~windowProperties:
 * @param windowName
 * @type string
 * @default Window
 * @text Window
 * @desc Filename of the window
 *
 * @param windowBackground
 * @type select
 * @option Window
 * @value 0
 * @option Dim
 * @value 1
 * @option Transparent
 * @value 2
 * @default 0
 * @text Window Background
 * @desc Background option for the window
 *
 * @param windowPlacement
 * @type select
 * @option Top
 * @value 0
 * @option Bottom
 * @value 1
 * @default 0
 * @text Window Placement
 * @desc Placement option for the window within the screen. The window always remain above the status window.
 *
 * @param windowBackOpacity
 * @type number
 * @min 0
 * @max 255
 * @default 192
 * @text Window Back Opacity
 * @desc Opacity of the window background (0 - 255)
 */

/*~struct~fontProperties:
 * @param fontFile
 * @type string
 * @default mplus-1m-regular.woff
 * @text Font Filename
 * @desc Filename of the main font for the text.  Include format type with the font filename.
 *
 * @param fontName
 * @type string
 * @default Verdana
 * @text Fallback Font Name
 * @desc Name of the Fallback Font for the text
 *
 * @param fontSize
 * @type number
 * @min 8
 * @max 32
 * @default 26
 * @text Font Size
 * @desc Size of the font used for the text (8 - 32)
 *
 * @param fontBold
 * @type boolean
 * @on On
 * @off Off
 * @default false
 * @text Font Bold
 * @desc Turn on/off bold for the text
 *
 * @param fontItalic
 * @type boolean
 * @on On
 * @off Off
 * @default false
 * @text Font Italic
 * @desc Turn on/off italic for the text
 *
 * @param textColorIndex
 * @type number
 * @min 0
 * @max 31
 * @default 0
 * @text Text Color Index
 * @desc Color index for the text color (0 - 31).  Use the color index from the Show Text Event Command.
 *
 * @param outlineColor
 * @type string
 * @default transparent
 * @text Outline Color
 * @desc Color of the text outline.  Type the name/hex code of the javascript color or type "transparent" for no outline.
 */

(() => {
    //-----------------------------------------------------------------------------
  // PluginManager
  //

    const pluginName = "OneLineBattleMessage";
  const parameters = PluginManager.parameters(pluginName);
  const battleLogWindow = JsonEx.parse(parameters['battleLogWindow'] || {"windowName":"Window"});
  const windowName = String(battleLogWindow.windowName || '');
  const windowBackground = Number(battleLogWindow.windowBackground || 0);
  const windowPlacement = Number(battleLogWindow.windowPlacement || 0);
  const windowBackOpacity = Number(battleLogWindow.windowBackOpacity || 192);
  const battleLogFont = JsonEx.parse(parameters['battleLogFont'] || {"fontFile":"mplus-1m-regular.woff"});
  const fontFile = String(battleLogFont.fontFile || '');
  const fontName = String(battleLogFont.fontName || 'Verdana');
  const fontSize = Number(battleLogFont.fontSize || 26);
  const fontBold = eval(battleLogFont.fontBold || false);
  const fontItalic = eval(battleLogFont.fontItalic || false);
  const textColorIndex = Number(battleLogFont.textColorIndex || 0);
  const outlineColor = String(battleLogFont.outlineColor || 'transparent');
  const textAlignment = String(parameters['textAlignment'] || 'center');
  const messageSpeed = Number(parameters['messageSpeed'] || 16);
  const constantOpenness = eval(parameters['constantOpenness'] || false);

    //-----------------------------------------------------------------------------
  // Window_BattleLog
  //
  // The window for displaying battle progress. No frame is displayed, but it is
  // handled as a window for convenience.

  Window_BattleLog.prototype.initialize = function(rect) {
      Window_Base.prototype.initialize.call(this, rect);
      this.openness = 0;
      this.opacity = 255;
      this._lines = [];
      this._methods = [];
      this._waitCount = 0;
      this._waitMode = "";
      this._baseLineStack = [];
      this._spriteset = null;
      this._messageStarted = false;
      this.refresh();
  };

  Window_BattleLog.prototype.setStatusWindowHeight = function(statusWindowHeight) {
      this._statusWindowHeight = statusWindowHeight;
  }

  Window_BattleLog.prototype.updatePlacement = function() {
      const height = this._statusWindowHeight + this.height;
      this.y = (windowPlacement * (Graphics.boxHeight - height));
  };

  Window_BattleLog.prototype.loadBattleLogWindowskin = function() {
      this.windowskin = ImageManager.loadSystem(windowName);
  };

  Window_BattleLog.prototype.updateBattleLogWindowBackground = function() {
      this.setBackgroundType(windowBackground);
  };

  Window_BattleLog.prototype.updateBattleLogBackOpacity = function() {
      this.backOpacity = windowBackOpacity;
  };

  Window_BattleLog.prototype.setBattleLogFont = function() {
      if (fontFile !== '') {
          FontManager.load("rmmz-battlelogfont", fontFile);
          this.contents.fontFace = "rmmz-battlelogfont";
      } else {
          this.contents.fontFace = fontName;
      }
      this.contents.fontSize = fontSize;
      this.contents.fontBold = fontBold;
      this.contents.fontItalic = fontItalic;
      this.changeTextColor(ColorManager.textColor(textColorIndex));
      this.changeOutlineColor(outlineColor);
  };

  Window_BattleLog.prototype.messageSpeed = function() {
      return messageSpeed;
  };

  Window_BattleLog.prototype.update = function() {
      if (constantOpenness) {
          if ((BattleManager.isInTurn()) && (this._messageStarted)) {
              this.openness = 255;
          } else if ((BattleManager.isTurnEnd()) || (BattleManager.isBattleEnd())) {
              this.openness = 0;
              this._messageStarted = false;
          }
      }
      if (!this.updateWait()) {
          this.callNextMethod();
      }
  };

  Window_BattleLog.prototype.clear = function() {
      if (!(constantOpenness)) {
          this.openness = 0;
      }
      this._lines = [];
      this._baseLineStack = [];
      this.refresh();
  };

  Window_BattleLog.prototype.addText = function(text) {
      if (text) {
          if (!(constantOpenness)) {
              this.openness = 255;
          } else if ((constantOpenness)) {
              if (!(this._messageStarted)) {
                  this.openness = 255;
                  this._messageStarted = true;
              }
          }
          this._lines.push(text);
          this.refresh();
          this.wait();
      }
  };

  Window_BattleLog.prototype.refresh = function() {
      this.contents.clear();
      this.updatePlacement();
      this.loadBattleLogWindowskin();
      this.updateBattleLogWindowBackground();
      this.updateBattleLogBackOpacity();
      this.setBattleLogFont();
      for (let i = 0; i < this._lines.length; i++) {
          this.drawLineText(i);
      }
  };

  Window_BattleLog.prototype.drawLineText = function(index) {
      const rect = new Rectangle(0, 0, this.innerWidth, this.innerHeight);
      this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
      this.drawText(this._lines[index], rect.x, rect.y, rect.width, textAlignment);
  };

  //-----------------------------------------------------------------------------
  // Scene_Battle
  //
  // The scene class of the battle screen.

  Scene_Battle.prototype.createLogWindow = function() {
      const rect = this.logWindowRect();
      const statusWindowHeight = this.statusWindowRect().height;
      this._logWindow = new Window_BattleLog(rect);
      this._logWindow.setStatusWindowHeight(statusWindowHeight);
      this.addWindow(this._logWindow);
  };

  Scene_Battle.prototype.logWindowRect = function() {
      const wx = 0;
      const wy = 0;
      const ww = Graphics.boxWidth;
      const wh = this.calcWindowHeight(1, false);
      return new Rectangle(wx, wy, ww, wh);
  };
})();