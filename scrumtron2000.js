$(document).bind('pageinit', function() {
    var CLIPS = [
        'blockers1', 'blockers2', 'blockers3',
        'break1', 'break2', 'break3',
        'dayin1', 'dayin2',
        'dayout1', 'dayout2',
        'flawlessproductivity',
        'offline1', 'offline2',
        'scrum1',
        'superscrum1', 'superscrum2', 'superscrum3',
        'timeforscrum1', 'timeforscrum2', 'timeforscrum3',
        'tom1'
    ];

    var audios = [];
    var buttons = [];
    for (var i = 0, len = CLIPS.length; i < len; i += 1) {
        var clip = CLIPS[i];
        audios.push($('<audio>')
            .attr({
                'id': clip,
                'src': clip + '.mp3',
                'preload': 'preload'
            })
            .on('ended', function() {
                if (this.currentTime) {
                    this.currentTime = 0;
                }
            }))

        buttons.push($('<button>')
            .attr({
                'id': clip + '-button',
                'data-role': 'button',
                'data-inline': 'true',
                'data-corners': 'false',
                'data-mini': 'true'
            })
            .text(clip)
            .on('click', function() {
                var c = $('#' + this.id.split('-')[0])[0];
                if (c.currentTime) {
                    c.currentTime = 0;
                }
                c.play();
            }))
    }
    $('#audios').append(audios);
    $('#buttons').append(buttons).trigger('create');
});
