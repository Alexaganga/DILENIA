// PictureWaveFilter.js Ver.1.0.0
// MIT License (C) 2025 あわやまたな
// http://opensource.org/licenses/mit-license.php

/*:
* @target MZ
* @plugindesc Apply a sine wave to the picture.
* @author あわやまたな (Awaya_Matana)
* @url https://awaya3ji.seesaa.net/article/514606885.html
* @help Ver.1.0.0
* [Specifications]
* The wavelength also changes according to the screen resolution.
*
* @param scale
* @text Scale
* @desc Decreasing this value will shorten the wavelength.
* @default 1
*
* @command setStrength
* @text Set Strength
* @arg pictureId
* @text Picture ID
* @default 1
* @arg strength
* @text Strength
* @default 0
* @arg duration
* @text Duration
* @default 0
* @arg wait
* @text Wait for Completion
* @default true
* @type boolean
*/

/*:ja
* @target MZ
* @plugindesc ピクチャに正弦波を適用します。
* @author あわやまたな (Awaya_Matana)
* @url https://awaya3ji.seesaa.net/article/514606885.html
* @help [仕様]
* 解像度に合わせて波長も変化します。
*
* [更新履歴]
* 2025/04/27：Ver.1.0.0　公開。
*
* @param scale
* @text 大きさ
* @desc 小さくすると波長が短くなります。
* @default 1
*
* @command setStrength
* @text 強さの設定
* @arg pictureId
* @text ピクチャID
* @default 1
* @arg strength
* @text 強さ
* @default 0
* @arg duration
* @text 時間
* @default 0
* @arg wait
* @text 完了までウェイト
* @default true
* @type boolean
*/

'use strict';
{
	//プラグイン名取得。
	const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];
	const params = PluginManager.parameters(pluginName);
	const scale = Number(params.scale || 0)||1;

	//-----------------------------------------------------------------------------
	// PluginManager

	const _PluginManager = window.PluginManagerEx ?? PluginManager;
	const _pluginName = window.PluginManagerEx ? document.currentScript : pluginName;
	_PluginManager.registerCommand(_pluginName, "setStrength", function(args) {
		const d = +args.duration;
		$gameScreen.wavePicture(+args.pictureId, +args.strength, d);
		if (String(args.wait) === "true" && d > 0) {
			this.wait(d);
		}
	});

	//-----------------------------------------------------------------------------
	// Game_Screen

	Game_Screen.prototype.wavePicture = function(pictureId, strength, duration) {
		const picture = this.picture(pictureId);
		if (picture) {
			picture.wave(strength, duration);
		}
	};

	if (PluginManager._scripts.contains("PictureControlExtend")) {
		const _Game_Screen_wavePicture = Game_Screen.prototype.wavePicture;
		Game_Screen.prototype.wavePicture = function() {
			this.iteratePictures(_Game_Screen_wavePicture, arguments);
		};
	}

	//-----------------------------------------------------------------------------
	// Game_Picture

	const _Game_Picture_initialize = Game_Picture.prototype.initialize;
	Game_Picture.prototype.initialize = function() {
		_Game_Picture_initialize.call(this);
		this._waveStrength = 0;
		this._waveStrengthTarget = 0;
		this._waveDuration = 0;
		this._waveCount = 0;
	};

	Game_Picture.prototype.waveStrength = function() {
		return this._waveStrength;
	};

	Game_Picture.prototype.waveCount = function() {
		return this._waveCount;
	};

	Game_Picture.prototype.wave = function(strength, duration) {
		this._waveStrengthTarget = strength;
		this._waveDuration = duration || 0;
		if (!this._waveDuration) {
			this._waveStrength = strength;
		}
	};

	const _Game_Picture_update = Game_Picture.prototype.update;
	Game_Picture.prototype.update = function() {
		_Game_Picture_update.call(this);
		this.updateWave();
	};

	Game_Picture.prototype.updateWave = function() {
		if (this._waveDuration > 0) {
			const d = this._waveDuration;
			this._waveStrength = (this._waveStrength * (d - 1) + this._waveStrengthTarget) / d;
			this._waveDuration--;
		}
		this._waveCount++;
		this._waveCount %= 30;
	};

	//-----------------------------------------------------------------------------
	// Sprite_Picture

	const _Sprite_Picture_initialize = Sprite_Picture.prototype.initialize;
	Sprite_Picture.prototype.initialize = function(pictureId) {
		_Sprite_Picture_initialize.call(this, pictureId);
		this._waveStrength = 0;
		this._wavePadding = 0;
		this._waveScale = 1;
		this._wavePos = 0;
	};

	Sprite_Picture.prototype.setWaveStrength = function(strength) {
		if (this._waveStrength !== strength) {
			this._waveStrength = strength;
			this._updateWaveFilter();
		}
	};

	Sprite_Picture.prototype.setWavePadding = function(pad) {
		if (this._wavePadding !== pad) {
			this._wavePadding = pad;
			this._updateWaveFilter();
		}
	};

	Sprite_Picture.prototype.setWavePos = function(pos) {
		if (this._wavePos !== pos) {
			this._wavePos = pos;
			this._updateWaveFilter();
		}
	};

	Sprite_Picture.prototype.setWaveScale = function(scale) {
		if (this._waveScale !== scale) {
			this._waveScale = scale;
			this._updateWaveFilter();
		}
	};

	Sprite_Picture.prototype._createWaveFilter = function() {
		this._waveFilter = new WaveFilter();
		if (!this.filters) {
			this.filters = [];
		}
		this.filters.push(this._waveFilter);
	};

	Sprite_Picture.prototype._updateWaveFilter = function() {
		if (!this._waveFilter) {
			this._createWaveFilter();
		}
		this._waveFilter.padding = this._wavePadding;
		this._waveFilter.uniforms.pos = this._wavePos;
		this._waveFilter._scale = this._waveScale;
		this._waveFilter.enabled = this._waveStrength > 0;
	};

	const _Sprite_Picture_updateOther = Sprite_Picture.prototype.updateOther;
	Sprite_Picture.prototype.updateOther = function() {
		_Sprite_Picture_updateOther.call(this);
		this.setWaveStrength(this.picture().waveStrength());
		if (this._waveStrength > 0) {
			this.setWavePos(this.picture().waveCount());
			const pad = Graphics.width * this.scale.x * this._waveStrength/80;
			this.setWavePadding(pad);
			this.setWaveScale(this.scale.y);
		}
	};

	//-----------------------------------------------------------------------------
	// WaveFilter

	function WaveFilter() {
		this.initialize(...arguments);
	}

	WaveFilter.prototype = Object.create(PIXI.Filter.prototype);
	WaveFilter.prototype.constructor = WaveFilter;

	WaveFilter.prototype.initialize = function() {
		PIXI.Filter.call(this, null, this._fragmentSrc());
		this.autoFit = false;
		this.uniforms.pos = 0;
		this.uniforms.scale = 1;
		this.uniforms.offset = [0, 0];
		this._scale = 1;
		this._startPos = 0;
	};

	WaveFilter.prototype._fragmentSrc = function() {
		const src =
		`varying vec2 vTextureCoord;
		uniform sampler2D uSampler;
		uniform float pos;
		uniform float scale;
		uniform vec2 offset;
		void main() {
			float pi = acos(-1.0);
			float ty = (vTextureCoord.y-offset.y)/scale;
			float ox = -offset.x * sin((ty*15.0+pos/15.0)*pi);
			gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + ox, vTextureCoord.y));
		}`;
		return src;
	};

	WaveFilter.prototype.apply = function (filterManager, input, output, clearMode, _currentState) {;
		const width = _currentState.destinationFrame.width;
		const height = _currentState.destinationFrame.height;
		this.uniforms.scale = Graphics.height*this._scale*scale/height;
		this.uniforms.offset = [this.padding/width, this.padding/height];
		filterManager.applyFilter(this, input, output, clearMode);
	};
}