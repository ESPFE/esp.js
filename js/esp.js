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


esp =
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
    
    events:
    {
        swipedetect: function(el, callback, preventDefault)
        {
            var touchsurface = el;
            var swipedir;
            var startX;
            var startY;
            var distX;
            var distY;
            var threshold = 150; //required min distance traveled to be considered swipe
            var restraint = 100; // maximum distance allowed at the same time in perpendicular direction
            var allowedTime = 300; // maximum time allowed to travel that distance
            var elapsedTime;
            var startTime;
            var handleswipe = callback || function(swipedir){};

            touchsurface.addEventListener('touchstart', function(e){
                var touchobj = e.changedTouches[0];
                swipedir = 'none';
                dist = 0;
                startX = touchobj.pageX;
                startY = touchobj.pageY;
                startTime = new Date().getTime(); // record time when finger first makes contact with surface
                
                if(preventDefault)
                {
                    e.preventDefault();
                }
            }, false);

            touchsurface.addEventListener('touchmove', function(e){
                if(preventDefault)
                {
                    e.preventDefault();
                } // prevent scrolling when inside DIV
            }, false);

            touchsurface.addEventListener('touchend', function(e){
                var touchobj = e.changedTouches[0];
                distX = touchobj.pageX - startX; // get horizontal dist traveled by finger while in contact with surface
                distY = touchobj.pageY - startY; // get vertical dist traveled by finger while in contact with surface
                elapsedTime = new Date().getTime() - startTime; // get time elapsed
                if (elapsedTime <= allowedTime){ // first condition for awipe met
                    if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
                        swipedir = (distX < 0)? 'left' : 'right'; // if dist traveled is negative, it indicates left swipe
                    }
                    else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
                        swipedir = (distY < 0)? 'up' : 'down'; // if dist traveled is negative, it indicates up swipe
                    }
                }
                handleswipe(swipedir, e);
                if(preventDefault)
                {
                    e.preventDefault();
                }
            }, false);
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
	},
    
    calendar:
    {
        // labels for day and month in an array
        // 0 => en_EN
        // 1 => de_DE
        dowLabels: [
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
        ],
        monthLabels: [
            ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
        ],
               
        createAsTable: function(month, year, tableId, lang = 0)
        {
            var tableArr = $(tableId);
            if(tableArr.length < 1)
            {
                console.log('can not find id ' + tableId);
                return false;
            }
            tableArr.prepend('<caption><span class="esp-calendar-headline"></span></caption>');
            // write table Head with DOW
            var dowRow = '<thead><tr>';
            for(var i = 0; i < 7; i++)
            {
                dowRow = dowRow + '<td>' + esp.calendar.dowLabels[lang][i] + '</td>';
            }
            dowRow = dowRow + '</tr></thead>';
            tableArr.append(dowRow);
            tableArr.append('<tbody></tbody>');
            
            esp.calendar.loadMonth(month, year, tableId, lang);
        },
        
        injectPrevMonthButton: function(tableId, code = '<i class="fa fa-chevron-left esp-calendar-prev"></i>')
        {
            var tableCaption = $(tableId + ' caption');
            if(tableCaption.length < 1)
            {
                console.log('can not find id ' + tableId);
                return false;
            }
            tableCaption.prepend(code);
        },
        
        injectNextMonthButton: function(tableId, code = '<i class="fa fa-chevron-right esp-calendar-next"></i>')
        {
            var tableCaption = $(tableId + ' caption');
            if(tableCaption.length < 1)
            {
                console.log('can not find id ' + tableId);
                return false;
            }
            tableCaption.append(code);
        },
        
        loadMonth: function(month, year, tableId, lang = 0)
        {
            // check for valid month
            if(month < 0 || month > 11)
            {
                console.log('Invalid value for month (0-11)');
                return false;
            }
            
            var tableArr = $(tableId);
            if(tableArr.length < 1)
            {
                console.log('can not find id ' + tableId);
                return false;
            }
            
            // get Current Day, Month, Year
            var now = new Date();
            var currentDay = now.getDate();
            var currentMonth = now.getMonth();
            var currentYear = now.getYear() + 1900;
            
            // get first week day of month
            var time = new Date(year, month, 1);
            var start = time.getDay();
            
            if(start > 0)
            {
                start -= 1;
            }
            else
            {
                start = 6;
            }
            
            // most month have 31 days
            var stop = 31;
            // April (3), Juni (5), September (8) und November (10) have 30 Days...
            if(month == 3 || month == 5 || month == 8 || month == 10)
            {
                stop = 30;
            };
            // Febraury (1) has 28 Days
            if(month == 1)
            {
                stop = 28;
                // but in leap years ...
                if (year %   4 == 0) stop++;
                if (year % 100 == 0) stop--;
                if (year % 400 == 0) stop++;
            }
            
            // Store current year and current month in tables dataset
            // IMPORTANT !! do not use uppercase letters for dataset !!
            tableArr.data('currentmonth', month);
            tableArr.data('currentyear', year);

            var tableHeadline = esp.calendar.monthLabels[lang][month] + ' ' + year;
            tableArr.find('caption .esp-calendar-headline').html(tableHeadline);

            var tbody = '';

            for( var i = 0, dayCounter = 1; dayCounter <= stop; i++)
            {
                tbody = tbody + '<tr>';
                for(var j = 0; j < 7; j++)
                {
                    // insert empty cells befor start an after stop tag
                    if(((i == 0) && (j < 6) && (j < start)) || (dayCounter > stop))
                    {
                        tbody = tbody + '<td> </td>';
                    }
                    else
                    {
                        // insert normal cells with day number
                        // set class for today
                        if((year == currentYear) && (month == currentMonth) && (dayCounter == currentDay))
                        {
                            tbody = tbody + '<td class="esp-calendar-today" data-day="' + dayCounter + '" data-month="' + (month + 1) + '" data-year="' + year + '">' + dayCounter + '</td>';
                        }
                        else
                        {
                            tbody = tbody + '<td data-day="' + dayCounter + '" data-month="' + (month + 1) + '" data-year="' + year + '">' + dayCounter + '</td>';
                        }
                        dayCounter += 1;
                    }
                }
                tbody = tbody + '</td>';
            }
            tableArr.find('tbody').html(tbody);
        },
        
        loadPrevMonth: function(tableId)
        {
            
            var table = $(tableId);
            if(table.length < 1)
            {
                console.log('can not find id ' + tableId);
                return false;
            }
            
            var month = table.data('currentmonth') - 1;
            var year = table.data('currentyear');
            
            if( month < 0)
            {
                month = 11;
                year -= 1;
            }
            return esp.calendar.loadMonth(month, year, tableId);
        },
        
        loadNextMonth: function(tableId)
        {
            var table = $(tableId);
            if(table.length < 1)
            {
                console.log('can not find id ' + tableId);
                return false;
            }
            
            var month = table.data('currentmonth') + 1;
            var year = table.data('currentyear');
            
            if(month > 11)
            {
                month = 0;
                year += 1;
            }
            return esp.calendar.loadMonth(month, year, tableId);
        }
    }
};

$(document).ready(function()
{
    esp.parseDocument();
});