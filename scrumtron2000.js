/*
Copyright (c) 2011, Daniel Guerrero
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL DANIEL GUERRERO BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Uses the new array typed in javascript to binary base64 encode/decode
 * at the moment just decodes a binary base64 encoded
 * into either an ArrayBuffer (decodeArrayBuffer)
 * or into an Uint8Array (decode)
 *
 * References:
 * https://developer.mozilla.org/en/JavaScript_typed_arrays/ArrayBuffer
 * https://developer.mozilla.org/en/JavaScript_typed_arrays/Uint8Array
 */

var Base64Binary = {
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    /* will return a  Uint8Array type */
    decodeArrayBuffer: function(input) {
        var bytes = (input.length/4) * 3;
        var ab = new ArrayBuffer(bytes);
        this.decode(input, ab);

        return ab;
    },

    decode: function(input, arrayBuffer) {
        //get last chars to see if are valid
        var lkey1 = this._keyStr.indexOf(input.charAt(input.length-1));
        var lkey2 = this._keyStr.indexOf(input.charAt(input.length-2));

        var bytes = (input.length/4) * 3;
        if (lkey1 == 64) bytes--; //padding chars, so skip
        if (lkey2 == 64) bytes--; //padding chars, so skip

        var uarray;
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        var j = 0;

        if (arrayBuffer)
            uarray = new Uint8Array(arrayBuffer);
        else
            uarray = new Uint8Array(bytes);

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        for (i=0; i<bytes; i+=3) {
            //get the 3 octects in 4 ascii chars
            enc1 = this._keyStr.indexOf(input.charAt(j++));
            enc2 = this._keyStr.indexOf(input.charAt(j++));
            enc3 = this._keyStr.indexOf(input.charAt(j++));
            enc4 = this._keyStr.indexOf(input.charAt(j++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            uarray[i] = chr1;
            if (enc3 != 64) uarray[i+1] = chr2;
            if (enc4 != 64) uarray[i+2] = chr3;
        }

        return uarray;
    }
}


$(document).bind('pageinit', function(event) {
    if (event.target.id !== 'scrumtron2000') {
        return;
    }

    var OGG_PATH = 'static/audio/ogg/';
    var audioContext;
    var buttons = [];
    var _4d3d3d3 = {
        'engaged': false,
        'factor': 4,
        'factorDefault': 4,
        'factorStep': 2,
        'factorMin': 2,
        'factorMax': 10,
        'delayJawn': 0.25,
        'gainJawn': -0.25
    };

    var kickUpThe4d3d3d3 = function(bufferSource) {
        var delay, gain;

        if (_4d3d3d3.factor < _4d3d3d3.factorMin) {
            _4d3d3d3.factor = _4d3d3d3.factorMin;
        }

        if (_4d3d3d3.factor > _4d3d3d3.factorMax) {
            _4d3d3d3.factor = _4d3d3d3.factorMax;
        }

        for (var i = 1; i <= _4d3d3d3.factor; i += 1) {
            gain = audioContext.createGain();
            gain.connect(audioContext.destination);
            gain.gain.value = _4d3d3d3.gainJawn * i;

            delay = audioContext.createDelay();
            delay.connect(gain);
            delay.delayTime.value = _4d3d3d3.delayJawn * i;

            bufferSource.connect(gain);
            bufferSource.connect(delay);
        }
    };

    var play = function() {
        var clip = clips[$(this).data('clip')];

        if (audioContext && clip.buffer) {
            var bufferSource = audioContext.createBufferSource();

            if (_4d3d3d3.engaged) {
                kickUpThe4d3d3d3(bufferSource);
            }

            bufferSource.buffer = clip.buffer;
            bufferSource.connect(audioContext.destination);
            bufferSource.noteOn(0);
        } else if (clip.audio){
            clip.audio.cloneNode().play();
        }
    };

    var createButton = function(clipName) {
        return $('<button>')
            .data('clip', clipName)
            .attr({
                'data-role': 'button',
                'data-inline': 'true',
                'data-corners': 'false',
                'data-mini': 'true',
                'data-shadow': 'false'
            })
            .text(clipName)
            .on('click', play);
    };

    if (window.webkitAudioContext) {
        audioContext = new webkitAudioContext();
    } else if (window.AudioContext) {
        audioContext = new AudioContext();
    }

    if (audioContext) {
        $('#kickUpThe4d3d3d3').show();
        $('#4d3d3d3Engaged').on('slidestop', function(event) {
            if (event.target.value === 'on') {
                _4d3d3d3.engaged = true;
            } else {
                _4d3d3d3.engaged = false;
                _4d3d3d3.factor = _4d3d3d3.factorDefault;
            }
        });

        $('#kickItUp').on('click', function() {
            _4d3d3d3.factor += _4d3d3d3.factorStep;
        });

        $('#LAME').on('click', function() {
            _4d3d3d3.factor -= _4d3d3d3.factorStep;
        });

        $.each(clips, function(clipName, clipData) {
            var arrayBuffer = Base64Binary.decodeArrayBuffer(clipData.base64);
            audioContext.decodeAudioData(arrayBuffer, function(audioData) {
                clipData.buffer = audioData;
            });
            buttons.push(createButton(clipName));
        });
    } else {
        $.each(clips, function(clipName, clipData) {
            var audio = new Audio(OGG_PATH + clipName + '.ogg');
            audio.preload = 'auto';
            clipData.audio = audio;
            buttons.push(createButton(clipName));
        });
    }

    $('#buttons').append(buttons).trigger('create');
});
