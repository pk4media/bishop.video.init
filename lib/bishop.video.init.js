/*
 * Developer : David Negstad (davidn@pk4media.com)
 * Date : 04/25/2012
 * All code (c)2012 PK4 Media LLC all rights reserved
 */

(function() {

function loadScript(url, callback) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  
  if (script.readyState) {
    script.onreadystatechange = function() {
      if (script.readyState == 'loaded' || script.readyState == 'complete') {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    script.onload = function() {
      callback();
    };
  }
  
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}
  
/**
 * Is the specified value defined (not undefined and not null)?
 * @argument value  The value to check
 * @returns {Boolean} True if the value is defined, false otherwise
 */
function isDefined(value) {
    return typeof value !== 'undefined' && value !== null;
}


/**
 * Is the specified value an integer (numeric and not a float)?
 * @argument value  The value to check
 * @returns {Boolean} True if the value is an Integer, false otherwise
 */
function isInt(value) {
    return !isNaN(value) && parseFloat(value) == parseInt(value);
}


/**
 * Is the specified value or object an Array?
 * @argument value  The value to check
 * @returns {Boolean} True if the value is an Array, false otherwise
 */
function isArray(value) {
    return value && value.constructor == Array;
}


/**
 * The BishopPlayer class wraps the constants and methods used to dynamically create a new embeded iframe video player
 */
var Bishop =
{
  defaultWidth: 480,
  heightRatio: 0.5625,
  domain: 'http://localhost:3000',
  url: 'http://localhost:3000/player/',
  playerIdPrefix: 'bishop_player_',
  playerId: 0,
  enableScripting: false,

  /**
   * Initialize the Bishop Embedded Player system
   *
   * @param readyCallback {Function}  The function to call once the player system has been initialized
   * @param enableScripting {Boolean} Should postMessage scripting be enabled to the embedded player?
   */
  initialize: function(readyCallback, enableScripting) {
    Bishop.enableScripting = enableScripting;
    if (typeof jQuery == 'undefined') {
      loadScript('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
        if (enableScripting && $.postMessage == null) {
          loadScript('http://cachedcommons.org/cache/jquery-postmessage/0.5.0/javascripts/jquery-postmessage-min.js', function() {
            readyCallback();
          });
        } else {
          readyCallback();
        }
      });
    } else {
      if (enableScripting && $.postMessage == null) {
        loadScript('http://cachedcommons.org/cache/jquery-postmessage/0.5.0/javascripts/jquery-postmessage-min.js', function() {
          readyCallback();
        });
      } else {
        readyCallback();
      }
    }
    
    if (Bishop.enableScripting) {
      Bishop.BishopPlayer = BishopPlayer;
    }
  },
    
  /**
   * Create a new Bishop Player iframe element to embed a video in the page
   * 
   * @param element   The HTML element to replace with a Bishop Player iframe or the id of the element to replace
   * @param {JSON} arguments  The player initialization arguments in JSON format
   * @returns {Object|null} The contentWindow of the new iframe element or null if the iframe couldn't be created
   */
  createPlayer: function(element, parameters) {
    // default player values
    var playerId = Bishop.playerId++;
    
    // read the id of the video to embed
    var videoId = isDefined(parameters.videoId) ? parameters.videoId : "";
    
    // read the video width from configuration (or use the default)
    var width = (isInt(parameters.width) && parameters.width > 0) ? parameters.width : Bishop.defaultWidth;
    // calculate the video height based on the width
    var height = parseInt(width * Bishop.heightRatio);
    
    // build the initial video url from the video source url and the video id to play
    var videoUrl = Bishop.url + videoId + '?playerId=' + playerId;
    
    var iframeId = Bishop.playerIdPrefix + playerId.toString();
    
    var iframeHtml = '<iframe id="' + iframeId + '" name="' + iframeId + '" type="text/html" width="' + width + '" height="' + height + '" src="' + videoUrl + '" frameborder="0" />';
    
    $(element).replaceWith(iframeHtml);
    var iframe = $('#' + iframeId)[0];
    
    // return the contentWindow element of the new iframe
    // this object is the target for postMessage events
    return new BishopPlayer(playerId, iframe, parameters.events);
  }
};

/**
 * BishopPlayer object constructor
 * Exposes methods for controlling a video player embedded in an iframe using postMessage
 */
function BishopPlayer(playerId, frame, events) {
  this.playerId = playerId.toString();
  this.frame = frame;
  this.events = events;
  
  if (Bishop.enableScripting) {
    // register methods for controling video playback
    this.play = function() {
        $.postMessage(
          { command: 'play' },
          this.frame.src,
          this.frame.contentWindow
        );
    };
    this.pause = function() {
        $.postMessage(
          { command: 'pause' },
          this.frame.src,
          this.frame.contentWindow
        );
    };
    this.volume = function(level) {
      if (level < 0) {
        level = 0;
      } else if (level > 100) {
        level = 100;
      }
      $.postMessage(
        { command: 'volume', level: level },
        this.frame.src,
        this.frame.contentWindow
      );
    };
    
    /*
    this.onPlay = function(handler) {
        pm.unbind(this.playerId + 'playing', this.events.play);
        this.events.play = handler;
        pm.bind(this.playerId + 'playing', this.events.play);
    };
    this.onPause = function(handler) {
        pm.unbind(this.playerId + 'pause', this.events.pause);
        this.events.pause = handler;
        pm.bind(this.playerId + 'pause', this.events.pause);
    };
    this.onVolume = function(handler) {
        pm.unbind(this.playerId + 'volume', this.events.volume);
        this.events.volume = handler;
        pm.bind(this.playerId + 'volume', this.events.volume);
    }
    */
  }
}

window.Bishop = Bishop;
}).call(this);