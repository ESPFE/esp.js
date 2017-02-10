/* 
 * Copyright (C) 2016 asuennemann
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

var esp =
{
    parseDocument: function()
    {
            esp.nav.parseDocument();
            esp.carousel.parseDocument();
    },
	
	screen:
	{
		xsMin: 0,
		xsMax: 768,
		smMin: 769,
		smMax: 991,
		mdMin: 992,
		mdMax: 1199,
		ldMin: 1200
	},
	
    nav:
    {
        parseDocument: function()
        {
            var button = $('.esp-toggle-nav');
            button.click(function()
            {
                esp.nav.toggle(this);
            });
        },

        toggle: function(button)
        {
            var target = $(button.dataset['target']);
            var toggleClass = button.dataset['toggleclass'];

            target.toggleClass(toggleClass);

            if( 'caret' in button.dataset )
            {
                var caret = $(button.dataset['caret']);
                caret.toggleClass('nav-expanded');
            }
        }
    },

    adjustMinHeight: function(heightSource, heightTarget)
    {
        var minHeight = $(heightSource).height();
        $(heightTarget).css('min-height', minHeight);
    },

    carousel:
    {
        data: new Array(),

        parseDocument: function()
        {
            var tmp = $('.esp-carousel');
            for( var i = 0; i < tmp.length; i++)
            {
                var images = $(tmp[i]).find('img');
				esp.carousel.data[i] = new Array();
				esp.carousel.data[i]['images'] = images;
				esp.carousel.data[i]['current'] = 0;
                var btnNext = $(tmp[i]).find('.esp-next');
				btnNext.attr('data-espcarouselindex', i);
                var btnPrev = $(tmp[i]).find('.esp-prev');
				btnPrev.attr('data-espcarouselindex', i);

                $(btnNext).click(function()
                {
                    esp.carousel.loadNext(this);
                });

                $(btnPrev).click(function()
                {
                    esp.carousel.loadPrev(this);
                });
                
                // add swipe left/right event
                for(var j = 0; j < images.length; j++)
                {
                    esp.events.swipedetect(images[j], function(swipedir, event)
                    {
                        
                        if(swipedir === 'left')
                        {
                            esp.carousel.loadNext(event.currentTarget);
                            event.preventDefault();
                        }
                        else if(swipedir === 'right')
                        {
                            esp.carousel.loadPrev(event.currentTarget);
                            event.preventDefault();
                        }
                    });
                }
            }
        },

        loadNext: function(button)
        {
			var carouselIndex = button.dataset['espcarouselindex'];
			var currentIndex = esp.carousel.data[carouselIndex]['current'];
			var currentImage = esp.carousel.data[carouselIndex]['images'][currentIndex];
			var nextIndex = currentIndex + 1;
			
			if( nextIndex >= esp.carousel.data[carouselIndex]['images'].length)
			{
				nextIndex = 0;
			}
			var nextImage = esp.carousel.data[carouselIndex]['images'][nextIndex];
			esp.carousel.data[carouselIndex]['current'] = nextIndex;
			
			$(currentImage).toggleClass('esp-show');
			$(nextImage).toggleClass('esp-show');
        },

        loadPrev: function(button)
        {
            var carouselIndex = button.dataset['espcarouselindex'];
			var currentIndex = esp.carousel.data[carouselIndex]['current'];
			var currentImage = esp.carousel.data[carouselIndex]['images'][currentIndex];
			var prevIndex = currentIndex - 1;
			
			if(prevIndex < 0)
			{
				prevIndex = esp.carousel.data[carouselIndex]['images'].length - 1;
			}
			var prevImage = esp.carousel.data[carouselIndex]['images'][prevIndex];
			esp.carousel.data[carouselIndex]['current'] = prevIndex;
			
			$(currentImage).toggleClass('esp-show');
			$(prevImage).toggleClass('esp-show');
        }
    },
	
	// YouTube Video API integration
	yt: {
		// in this array we stock all youtube video objects
		// the id of the iframe is the array index of each youtube video object
		players: new Array(),
		// current playing video/iframe
		// playingId is null if no video plays
		playingId: null,
		// every youtube iframe must have this class set
		iframeClass: 'esp-yt-video',
		// assign this classes to DOM elements to start/stop/start-stop a video
		// the DOM element needs also the data-for attribute set
		// the data-for attribute specifies the iframe id of the video to start/stop
		// or use the functions start, stop, startStop
		startClass: 'esp-yt-start',
		stopClass: 'esp-yt-stop',
		startStopClass: 'esp-yt-start-stop',
		
		parseDocument: function()
		{
			// find iframes with youtube video
			var ytIframes = $('.' + this.iframeClass);
			var startButtons = $('.' + this.startClass);
			var stopButtons = $('.' + this.stopClass);
			var startStopButtons = $('.' + this.startStopClass);
			
			// create youtube video objects
			for(var i = 0; i < ytIframes.length; i++)
			{
				var currentId = ytIframes[i].id;
				this.players[currentId] = new YT.Player(currentId);
				this.players[currentId].addEventListener('onStateChange', function(e)
				{
                    // clear playingId if video ends
                    if(e.data === YT.PlayerState.ENDED )
                    {
                        esp.yt.playingId = null;
                    }
                    // stop current running video, if another starts with the youtube integrated start/stop button
                    if(e.data === YT.PlayerState.PLAYING)
                    {
                        // Get id of started player
                        var playerId = e.target.a.id;
                        if(esp.yt.playingId !== playerId)
                        {
                            esp.yt.players[esp.yt.playingId].pauseVideo();
                            esp.yt.playingId = playerId;
                        }
                    }
				});
			}
			
			startButtons.click(function()
			{
				esp.yt.start(this);
			});
			stopButtons.click(function()
			{
				esp.yt.stop(this);
			});
			startStopButtons.click(function()
			{
				esp.yt.startStop(this);
			});
		},
		
		start: function(target, callback)
		{
			var forPlayer = target.dataset['for'];
			if(esp.yt.playingId !== null)
			{
				esp.yt.players[esp.yt.playingId].pauseVideo();
			}
            esp.yt.playingId = forPlayer;
			esp.yt.players[forPlayer].playVideo();
			// run callback
			if(callback)
			{
				callback(target);
			}
			return false;
		},
		
		stop: function(target, callback)
		{
			var forPlayer = target.dataset['for'];
			if(esp.yt.playingId === forPlayer)
			{
				esp.yt.players[forPlayer].pauseVideo();
				esp.yt.playingId = null;
			}
			if(callback)
			{
				callback(target);
			}
			return false;
		},
		
		startStop: function(target, callback)
		{
			var forPlayer = target.dataset['for'];
			if(esp.yt.playingId === forPlayer)
			{
				esp.yt.players[forPlayer].pauseVideo();
				esp.yt.playingId = null;
			}
			else
			{
				if(esp.yt.playingId !== null)
				{
					esp.yt.players[esp.yt.playingId].pauseVideo();
				}
                esp.yt.playingId = forPlayer;
				esp.yt.players[forPlayer].playVideo();
			}
			if(callback)
			{
				callback(target);
			}
			return false;
		}
	}
};

$(document).ready(function()
{
    esp.parseDocument();
});