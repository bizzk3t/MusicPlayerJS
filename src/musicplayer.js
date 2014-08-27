/*
    A customizeable music player for those who prefer something more than
    the default player.

    Copyright (C) 2014  William Harrison

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/    



function addPlayer(id, songFile, song, artist, colors)
{
    var colorBackground = colors[0];
    var colorPrimary = colors[1];
    var colorSecondary = colors[2];
    var colorStream = colors[3];

    var pcn = ".track-" + id + " ";

    $(".js-music-player").append("<div class='track-"+id+"'></div>");
    $(pcn).append("<div class='title'>"+artist + " - " + song+"</div><br />");
    $(pcn).append("<div class='player'></div>");
    $(pcn + ".player").append("<audio class='myAudio' src='"+songFile+"'></audio>");
    $(pcn + ".player").append("<div class='play-pause'></div>");
    $(pcn + ".play-pause").append("<canvas class='play-pause-button canvas'></canvas>");
    $(pcn + ".player").append("<div class='visual'></div>");
    $(pcn + ".visual").append("<canvas class='player-time canvas'></canvas>");
    $(pcn + ".visual").append("<canvas class='player-main canvas'></canvas>");
    
    //$(pcn + ".player").height($(pcn + ".play-pause").height());
    
    //$(pcn + ".player").height("75px");
    //$(pcn + ".play-pause").height("75px");
    $(pcn + ".visual").css("left", $(pcn + ".play-pause").width() + "px");
    $(pcn + ".visual").width($(".player").width() - $(".play-pause").width());
    

    var canvasMain = $(pcn + ".player-main");
    var canvasTime = $(pcn + ".player-time");
    var canvasPlayPause = $(pcn + ".play-pause-button");

    var ctxmain = canvasMain[0].getContext("2d");
    var ctxtime = canvasTime[0].getContext("2d");
    var ctxplaypause = canvasPlayPause[0].getContext("2d");

    var aud = $(pcn + ".myAudio")[0];
    var paused = true;

    var WIDTH = $(pcn + ".visual").width();
    var HEIGHT = $(pcn + ".visual").height();  

    canvasPlayPause[0].width = $(pcn + ".play-pause").width();
    canvasPlayPause[0].height = $(pcn + ".play-pause").height();

    ctxplaypause.fillStyle = colorPrimary;
    ctxplaypause.strokeStyle = colorBackground;
    ctxplaypause.lineWidth = 1;

    canvasMain[0].width = WIDTH;
    canvasMain[0].height = HEIGHT;
    ctxmain.fillStyle = colorStream;
    ctxmain.strokeStyle = colorSecondary;
    ctxmain.lineWidth = 1;

    canvasTime[0].width = WIDTH;
    canvasTime[0].height = HEIGHT;
    ctxtime.fillStyle = colorBackground;
    ctxtime.strokeStyle = colorPrimary;
    ctxtime.lineWidth = 1;

    
    drawPlayButton();

    $(pcn + ".myAudio").bind("timeupdate", function() {
        updateBarCanvas();
    });
    $(pcn + ".play-pause").click(function() {
            playPause();
    });
    /*
    $(document).keypress(function(event) {
        if(event.which = 32) {
            playPause();
        }   
    });
    */
    $(pcn + ".player-main").mousemove(function(event) {
        updateTimeCanvas(getTimeByPos(event.pageX-$(this).offset().left));
    });
    $(pcn + ".player-main").mouseout(function(event) {
        ctxtime.clearRect(0,0,WIDTH,HEIGHT);
    });
    $(pcn + ".player-main").mouseup(function(event) {
        aud.currentTime = getTimeByPos(event.pageX-$(this).offset().left);
        updateBarCanvas();
        keepPlaying();
    });

    function keepPlaying()
    {
        if(aud.paused) {
            aud.pause();
            drawPlayButton();
        } else {
            aud.play();
            drawPauseButton();
        }
    }

    function playPause()
    {
        if(aud.paused) {
            aud.play();
            drawPauseButton();
            paused = false;
        } else {
            aud.pause();
            drawPlayButton();
            paused = true;
        }
    }

    function drawPlayButton()
    {
        var xy = canvasPlayPause[0].width;
        var border = 0.20;
        var origin = xy*border;
        var end = xy-xy*border;

        ctxplaypause.clearRect(0,0,xy,xy);

        ctxplaypause.beginPath();
        ctxplaypause.moveTo(origin,origin);
        ctxplaypause.lineTo(end,xy/2);
        ctxplaypause.lineTo(origin,end);
        ctxplaypause.lineTo(origin,origin);
        ctxplaypause.closePath();
        ctxplaypause.fill();
        ctxplaypause.stroke();
    }

    function drawPauseButton()
    {
        var x = canvasPlayPause[0].width;
        var y = canvasPlayPause[0].height;
        ctxplaypause.clearRect(0,0,x,y);

        var border = 0.20;
        var topBorder = border * y;
        var botBorder = y - (border * y);
        var leftBorder = border * x;
        var rightBorder = x - (border * x);
        var xLen = (rightBorder - leftBorder)/3;
        var yLen = botBorder - topBorder;

        ctxplaypause.fillRect(leftBorder, topBorder, xLen, yLen); 
        ctxplaypause.fillRect(leftBorder+xLen+xLen, topBorder, xLen, yLen); 

    }

    function updateTimeCanvas(time)
    {
        ctxtime.clearRect(0,0,WIDTH,HEIGHT);
        pos = getPosByTime(time);
        ctxtime.beginPath();
        ctxtime.moveTo(pos,0);
        ctxtime.lineTo(pos,HEIGHT);
        ctxtime.closePath();
        ctxtime.fillRect(0,0,WIDTH,HEIGHT);
        ctxtime.fill();
        ctxtime.stroke();
        if(pos>25) {
            ctxtime.strokeText(toTime(Math.floor(time)),pos-25,20);
        } else {
            ctxtime.strokeText(toTime(Math.floor(time)),pos+5,20);
        }
    }

    function updateBarCanvas()
    {
        ctxmain.clearRect(0,0,WIDTH,HEIGHT);
        pos = getPosByTime(aud.currentTime);
        ctxmain.beginPath();
        ctxmain.moveTo(pos,0);
        ctxmain.lineTo(pos,HEIGHT);
        ctxmain.closePath();
        ctxmain.fillRect(0,0,pos,HEIGHT);
        ctxmain.fill();
        ctxmain.stroke();
        if(pos>25) {
            ctxmain.strokeText(toTime(Math.floor(aud.currentTime)),pos-25,10);
        } else {
            ctxmain.strokeText(toTime(Math.floor(aud.currentTime)),pos+5,10);
        }
    }

    function getTimeByPos(coord)
    {
        return (coord / WIDTH) * aud.duration;
    }

    function getPosByTime(time)
    {
        return (time / aud.duration) * WIDTH;
    }

}

function toTime(seconds)
{
    var tmp = seconds;
    var min = 0;
    var sec = 0;
    while(tmp>=60) {
        tmp = tmp - 60;
        min = min + 1;
    }
    sec = tmp;
    if(sec<10) {
        sec = "0" + sec
    }
    return min + ":" + sec;
}
