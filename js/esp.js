/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


$(document).ready(function()
{
    esp.parseDocument();
});


esp =
{
    parseDocument: function()
    {
            esp.nav.parseDocument();
            esp.carousel.parseDocument();
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
                var btnNext = $(tmp[i]).find('.esp-next');
                var btnPrev = $(tmp[i]).find('.esp-prev');

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
            var container = $(button).parent();
            var current = container.find('img.esp-show');
            var next = current.next('img');
            if(next.length === 0)
            {
                next = container.find('img').first();
            }
            current.toggleClass('esp-show');
            next.toggleClass('esp-show');
        },

        loadPrev: function(button)
        {
            var container = $(button).parent();
            var current = container.find('img.esp-show');
            var prev = current.prev('img');
            if(prev.length === 0)
            {
                prev = container.find('img').last();
            }
            current.toggleClass('esp-show');
            prev.toggleClass('esp-show');
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
    }
};