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
    if (event.target.id !== 'one') {
        return;
    }
    var audioContext;
    var buttons = [];
    var fourD3D3D = false;
    var fourD3D3DValue = 4;

    var play = function() {
        var clip = clips[$(this).data('clip')];

        if (audioContext && clip.buffer) {
            var bufferSource = audioContext.createBufferSource();

            if (fourD3D3D) {
                if (fourD3D3DValue < 2) {
                    fourD3D3DValue = 2;
                }

                if (fourD3D3DValue > 10) {
                    fourD3D3DValue = 10;
                }

                console.log('fourD3D3DValue: ', fourD3D3DValue);
                for (var i = 1; i < fourD3D3DValue; i += 1) {
                    var delayNode = audioContext.createDelayNode();
                    bufferSource.connect(delayNode);
                    delayNode.connect(audioContext.destination);
                    delayNode.delayTime.value = 0.25 * i;

                    var gainNode = audioContext.createGainNode();
                    bufferSource.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    gainNode.gain.value = -0.25 * i;
                }
            }

            bufferSource.buffer = clip.buffer;
            bufferSource.connect(audioContext.destination);
            bufferSource.noteOn(0);
        } else if (clip.audio){
            clip.audio.cloneNode().play();
        }
    };

    if (window.webkitAudioContext) {
        audioContext = new webkitAudioContext();
    } else if (window.AudioContext) {
        audioContext = new AudioContext();
    }

    if (audioContext) {
        $('#cool').show();
        $('#volume')
            .on('slidestop', function(event) {
                if (event.target.value === 'on') {
                    fourD3D3D = true;
                } else {
                    fourD3D3D = false;
                    fourD3D3DValue = 4;
                }
            });

        $('#up').on('click', function() {
            fourD3D3DValue += 2;
        });

        $('#down').on('click', function() {
            fourD3D3DValue -= 2;
        });
    }

    $.each(clips, function(clipName, clipData) {
        if (audioContext) {
            var arrayBuffer = Base64Binary.decodeArrayBuffer(clipData.base64);
            audioContext.decodeAudioData(arrayBuffer, function(audioData) {
                clipData.buffer = audioData;
            });
        } else {
            var audio = new Audio(clipName + '.ogg');
            audio.preload = 'auto';
            clipData.audio = audio;
        }

        buttons.push($('<button>')
            .data('clip', clipName)
            .attr({
                'data-role': 'button',
                'data-inline': 'true',
                'data-corners': 'false',
                'data-mini': 'true',
                'data-shadow': 'false'
            })
            .text(clipName)
            .on('click', play));
    });

    $('#buttons').append(buttons).trigger('create');
});
