/*!
 * Developer : David Negstad (davidn@pk4media.com)
 * Date : 04/25/2012
 * All code (c)2012 PK4 Media LLC all rights reserved
 */

(function() {
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
    url: 'http://localhost:3000/video/',
    playerId: 0,
    players: new Array(),
    /**
     * Create a new Bishop Player iframe element to embed a video in the page
     * 
     * @param element   The HTML element to replace with a Bishop Player iframe or the id of the element to replace
     * @param {JSON} arguments  The player initialization arguments in JSON format
     * @returns {Object|null} The contentWindow of the new iframe element or null if the iframe couldn't be created
     */
    createPlayer: function(element, parameters) {
        // if element is a string
        if (typeof element === 'string') {
            // lookup the page element with the id specified by the string value of element
            element = qwery(element);
        }
        
        // if the element variable is undefined
        if (!isDefined(element)) {
            return null;
        }
        
        // if element is an array
        if (isArray(element)) {
            // if element is an empty array
            if (element.length < 1) {
                return null;
            } else {
                element = element[0];
                
                // if the new element value is undefined
                if (!isDefined(element)) {
                    return null;
                }
            }
        }
    
        
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
        
        // build the video iframe to load for the page
        iframe = document.createElement('iframe');
        iframe.setAttribute('id', 'bishop_player_' + playerId.toString());
        iframe.setAttribute('name', 'bishop_player_' + playerId.toString());
        iframe.setAttribute('type', 'text/html');
        iframe.setAttribute('width', width);
        iframe.setAttribute('height', height);
        iframe.setAttribute('src', videoUrl);
        iframe.setAttribute('frameborder', '0');
        
        element.parentElement.replaceChild(iframe, element);
        
        // return the contentWindow element of the new iframe
        // this object is the target for postMessage events
        return new BishopPlayer(playerId, iframe, parameters.events);
    }
};

window.Bishop = Bishop;
}).call(this);