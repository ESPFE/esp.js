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

let esp =
{
    parseDocument: function()
    {
            esp.nav.parseDocument();
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
            let button = $('.esp-toggle-nav');
            button.click(function()
            {
                esp.nav.toggle(this);
            });
        },

        toggle: function(button)
        {
            let target = $(button.dataset['target']);
            let toggleClass = button.dataset['toggleclass'];

            target.toggleClass(toggleClass);

            if( 'caret' in button.dataset )
            {
                let caret = $(button.dataset['caret']);
                caret.toggleClass('nav-expanded');
            }
        }
    },

    adjustMinHeight: function(heightSource, heightTarget)
    {
        let minHeight = $(heightSource).height();
        $(heightTarget).css('min-height', minHeight);
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
            let ytIframes = $('.' + this.iframeClass);
            let startButtons = $('.' + this.startClass);
            let stopButtons = $('.' + this.stopClass);
            let startStopButtons = $('.' + this.startStopClass);

            // create youtube video objects
            for(let i = 0; i < ytIframes.length; i++)
            {
                let currentId = ytIframes[i].id;
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
                        let playerId = e.target.a.id;
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
            let forPlayer = target.dataset['for'];
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
            let forPlayer = target.dataset['for'];
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
            let forPlayer = target.dataset['for'];
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
        prevCallack: null,
        nextCallback: null,
        
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
        
        /**
         * 
         * @param string tableId
         * @param int lang
         */
        createAsTableNow: function(tableId, lang)
        {
            // set default parameters
            if(typeof(lang) === 'undefined') { lang = 0; }
            
            let now = new Date();
            let currentMonth = now.getMonth();
            let currentYear = now.getYear() + 1900;
            esp.calendar.createAsTable(currentMonth, currentYear, tableId, 1);
        },
        
        /* 
         * create calendar as a table
         * 
         * @param int month
         * @param int year
         * @param string tableId
         * @param int lang = 0      -> see dowLabels/monthLabels
         */
        createAsTable: function(month, year, tableId, lang)
        {
            // set default parameters
            if(typeof(lang) === 'undefined') { lang = 0; }
            
            let tableArr = $(tableId);
            if(tableArr.length < 1)
            {
                console.log('can not find id ' + tableId);
                return false;
            }
            tableArr.prepend('<caption><span class="esp-calendar-headline"></span></caption>');
            // write table Head with DOW
            let dowRow = '<thead><tr>';
            for(let i = 0; i < 7; i++)
            {
                dowRow = dowRow + '<td><span>' + esp.calendar.dowLabels[lang][i] + '</span></td>';
            }
            dowRow = dowRow + '</tr></thead>';
            tableArr.append(dowRow);
            tableArr.append('<tbody></tbody>');
            
            esp.calendar.loadMonth(month, year, tableId, lang);
        },
        
        /**
         * 
         * @param string tableId
         * @param string code       -> html code for button
         */
        injectPrevMonthButton: function(tableId, code)
        {
            // set default parameters
            if(typeof(code) === 'undefined') { code = '<i class="fa fa-chevron-left esp-calendar-prev"></i>'; }
            
            let tableCaption = $(tableId + ' caption');
            if(tableCaption.length < 1)
            {
                console.log('can not find id ' + tableId);
                return false;
            }
            tableCaption.prepend(code);
        },
        
        /**
         * 
         * @param string tableId
         * @param string code       -> html code for button
         */
        injectNextMonthButton: function(tableId, code)
        {
            // set default parameters
            if(typeof(code) === 'undefined') { code = '<i class="fa fa-chevron-right esp-calendar-next"></i>'; }
            
            let tableCaption = $(tableId + ' caption');
            if(tableCaption.length < 1)
            {
                console.log('can not find id ' + tableId);
                return false;
            }
            tableCaption.append(code);
        },
        
        /**
         * load a new month
         * 
         * @param int month
         * @param int year
         * @param string tableId
         * @param int lang
         */
        loadMonth: function(month, year, tableId, lang)
        {
            // set default parameters
            if(typeof(lang) === 'undefined') { lang = 0; }
            
            // check for valid month
            if(month < 0 || month > 11)
            {
                console.log('Invalid value for month (0-11)');
                return false;
            }
            
            let tableArr = $(tableId);
            if(tableArr.length < 1)
            {
                console.log('can not find id ' + tableId);
                return false;
            }
            
            // get Current Day, Month, Year
            let now = new Date();
            let currentDay = now.getDate();
            let currentMonth = now.getMonth();
            let currentYear = now.getYear() + 1900;
            
            // get first week day of month
            let time = new Date(year, month, 1);
            let start = time.getDay();
            
            if(start > 0)
            {
                start -= 1;
            }
            else
            {
                start = 6;
            }
            
            // most month have 31 days
            let stop = 31;
            // April (3), Juni (5), September (8) und November (10) have 30 Days...
            if(month === 3 || month === 5 || month === 8 || month === 10)
            {
                stop = 30;
            };
            // Febraury (1) has 28 Days
            if(month === 1)
            {
                stop = 28;
                // but in leap years ...
                if (year %   4 === 0) stop++;
                if (year % 100 === 0) stop--;
                if (year % 400 === 0) stop++;
            }
            
            // Store current year and current month in tables dataset
            // IMPORTANT !! do not use uppercase letters for dataset !!
            tableArr.data('currentmonth', month);
            tableArr.data('currentyear', year);

            let tableHeadline = esp.calendar.monthLabels[lang][month] + ' ' + year;
            tableArr.find('caption .esp-calendar-headline').html(tableHeadline);

            let tbody = '';

            for( let i = 0, dayCounter = 1; dayCounter <= stop; i++)
            {
                tbody = tbody + '<tr>';
                for(let j = 0; j < 7; j++)
                {
                    // insert empty cells befor start an after stop tag
                    if(((i === 0) && (j < 6) && (j < start)) || (dayCounter > stop))
                    {
                        tbody = tbody + '<td> </td>';
                    }
                    else
                    {
                        // insert normal cells with day number
                        // set class for today
                        if((year === currentYear) && (month === currentMonth) && (dayCounter === currentDay))
                        {
                            tbody = tbody + '<td class="esp-calendar-today" data-day="' + dayCounter + '" data-month="' + (month + 1) + '" data-year="' + year + '" data-id="' + String(dayCounter) + String(month + 1) + String(year) + '"><span>' + dayCounter + '</span></td>';
                        }
                        else
                        {
                            tbody = tbody + '<td data-day="' + dayCounter + '" data-month="' + (month + 1) + '" data-year="' + year + '" data-id="' + String(dayCounter) + String(month + 1) + String(year) + '"><span>' + dayCounter + '</span></td>';
                        }
                        dayCounter += 1;
                    }
                }
                tbody = tbody + '</td>';
            }
            tableArr.find('tbody').html(tbody);
        },
        
        /**
         * 
         * @param string tableId
         */
        loadPrevMonth: function(tableId)
        {
            
            let table = $(tableId);
            if(table.length < 1)
            {
                console.log('can not find id ' + tableId);
                return false;
            }
            
            let month = table.data('currentmonth') - 1;
            let year = table.data('currentyear');
            
            if( month < 0)
            {
                month = 11;
                year -= 1;
            }
            return esp.calendar.loadMonth(month, year, tableId);
        },
        
        /**
         * 
         * @param string tableId
         */
        loadNextMonth: function(tableId)
        {
            let table = $(tableId);
            if(table.length < 1)
            {
                console.log('can not find id ' + tableId);
                return false;
            }
            
            let month = table.data('currentmonth') + 1;
            let year = table.data('currentyear');
            
            if(month > 11)
            {
                month = 0;
                year += 1;
            }
            return esp.calendar.loadMonth(month, year, tableId);
        }
    },
    
    imageCarouselArray: null,
    
    imageCarousel: function(selector, intervalTime)
    {
        let self = this;
        this.container = $(selector);
        this.images = this.container.find('.image');
        this.controls = this.container.find('.image-controls .image-control');
        this.current = 0;
        this.max = this.images.length;

        $(this.images[0]).addClass('current');
        $(this.controls[0]).addClass('current');

        // clickhandler for image-controls
        this.controls.on('click', function()
        {
            let imageToLoad = $(this).data('forimage');
            self.loadImage(imageToLoad);
        });

        this.timeout = null;
        this.intervalTime = intervalTime;


        this.setTimeout = function()
        {
            if(this.timeout !== null)
            {
                window.clearTimeout(this.timeout);
            }
            this.timeout = window.setTimeout(function(obj)
            {
                obj.loadNext();
            }, this.intervalTime, this);
        };



        // load a specific image
        this.loadImage = function(image)
        {
            image = parseInt(image);
            if(image < 0 || image >= this.max)
            {
                return false;
            }

            this.images.removeClass('current');
            this.controls.removeClass('current');
            $(this.images[image]).addClass('current');
            $(this.controls[image]).addClass('current');
            this.current = image;
            this.setTimeout();
            return true;
        };

        this.loadNext = function()
        {
            let next = this.current + 1;
            if(next >= this.max)
            {
                next = 0;
            }
            this.loadImage(next);
        };

        this.setTimeout();
        
        if(esp.imageCarouselArray === null)
        {
            esp.imageCarouselArray = new Array();
        }
        esp.imageCarouselArray.push(this);
    }
};

$(document).ready(function()
{
    esp.parseDocument();
});