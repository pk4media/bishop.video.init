/*
 * Developer : David Negstad (davidn@pk4media.com)
 * Date : 04/25/2012
 * All code (c)2012 PK4 Media LLC all rights reserved
 */

(function() {

var config = {
  bishopUrl: 'http://localhost:3000/player/',
  defaultWidth: 480,
  heightRatio: 0.5625,
  playerIdPrefix: 'bishop_player_',
  scripts: {
    jquery: {
      isInstalled: function() {
        return typeof jQuery != 'undefined';
      },
      url: 'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js'
    },
    postmessage: {
      requires: ['jquery'],
      isInstalled: function() {
        return $.postMessage != null;
      },
      url: 'http://cachedcommons.org/cache/jquery-postmessage/0.5.0/javascripts/jquery-postmessage-min.js'
    }
  }
};


// Helper functions

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
 * The BishopPlayer class wraps the constants and methods used to dynamically create a new embeded iframe video player
 */
var Bishop =
{
  playerId: 0,
  readyCallback: null,


  /**
   * Load a required script for Bishop embedded video
   *
   * @param {Object} requiredScript The script information from the requiredScripts configuration block
   */
  loadScript: function(id, requiredScript) {
    if (requiredScript.isInstalled()) {
      requiredScript.loading = true;
      Bishop.scriptLoaded(id);
      return;
    }
    
    var script = document.createElement('script');
    script.type = 'text/javascript';
    
    if (script.readyState) {
      script.onreadystatechange = function() {
        if (script.readyState == 'loaded' || script.readyState == 'complete') {
          script.onreadystatechange = null;
          Bishop.scriptLoaded(id);
        }
      };
    } else {
      script.onload = function() {
        Bishop.scriptLoaded(id);
      };
    }
    
    script.src = requiredScript.url;
    document.getElementsByTagName('head')[0].appendChild(script);
  },


  /**
   * Callback function that is called whenever a script is loaded by the dynamic script loader
   *
   * @param {String} id The id of the script that has been loaded
   */
  scriptLoaded: function scriptLoaded(id) {
    // Mark the script as loaded
    config.scripts[id].loaded = true;
    config.scripts[id].loading = false;
    
    // Check for unloaded scripts with satisfied dependencies
    for (scriptId in config.scripts) {
      if (!config.scripts[scriptId].loaded && !config.scripts[scriptId].loading) {
        if (isDefined(config.scripts[scriptId].requires) && config.scripts[scriptId].requires.length > 0) {
          var loadedDependencies = 0;
          for (dependency in config.scripts[scriptId].requires) {
            if (config.scripts[config.scripts[scriptId].requires[dependency]].loaded) {
              loadedDependencies++;
            }
          }
          
          if (loadedDependencies == config.scripts[scriptId].requires.length) {
            this.loadScript(scriptId, config.scripts[scriptId]);
          }
        }
      }
    }
    
    for (scriptId in config.scripts) {
      if (!config.scripts[scriptId].loaded) {
        return;
      }
    }
    
    Bishop.readyCallback();
  },


  /**
   * Initialize the Bishop Embedded Player system
   *
   * @param readyCallback {Function}  The function to call once the player system has been initialized
   * @param enableScripting {Boolean} Should postMessage scripting be enabled to the embedded player?
   */
  initialize: function(readyCallback) {
    // Set Bishop variables
    this.readyCallback = readyCallback;
    
    for (scriptId in config.scripts) {
      // Only start loading scripts with no requirements
      if (!isDefined(config.scripts[scriptId].requires) || config.scripts[scriptId].requires.length <= 0) {
        this.loadScript(scriptId, config.scripts[scriptId]);
      }
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
    // Default player values
    var playerId = Bishop.playerId++;
    
    // read the id of the video to embed
    var videoId = isDefined(parameters.videoId) ? parameters.videoId : "";
    
    // read the video width from configuration (or use the default)
    var width = (isInt(parameters.width) && parameters.width > 0) ? parameters.width : config.defaultWidth;
    // calculate the video height based on the width
    var height = parseInt(width * config.heightRatio);
    
    // build the initial video url from the video source url and the video id to play
    var videoUrl = config.bishopUrl + videoId + '?playerId=' + playerId;
    
    var iframeId = config.playerIdPrefix + playerId.toString();
    
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

window.Bishop = Bishop;
}).call(this);