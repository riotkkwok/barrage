!function(factory){
    if(typeof define === 'function' && define.amd){
        // AMD
        define(factory);
    } else {
        // Browser globals
        factory();
    };
}(function(){
    var u = { // utility
        elm: function(selector){
            return document.querySelectorAll(selector);
        },
        extendObj: function(sObj, tObj){
            for(var key in tObj){
                if(tObj.hasOwnProperty(key)){
                    sObj[key] = tObj[key];
                }
            }
        },
        countBytes: function(str) {
            var totalLength = 0;
            var charCode;
            for (var i = 0; i < str.length; i++) {
                charCode = str.charCodeAt(i);
                if (charCode <= 0x007f) {
                    totalLength += 1;
                } else if (charCode <= 0x07ff) {
                    totalLength += 2;
                } else if (charCode <= 0xffff) {
                    totalLength += 3;
                } else {
                    totalLength += 4;
                }
            }
            return totalLength;
        }
    },
    w = {
        width: window.innerWidth,
    },
    tmpl = {
        track: '<div class="bulletT-track"></div>',
        // text: '<span class="bulletT-text" style="margin-left:{{left}};">{{text}}</span>',
        text: '<span class="bulletT-text" style="transition:{{trst}};">{{text}}</span>',
    },
    options = {
        container: '#bulletArea',
        lines: 1,
        discard: true, // discard the bullet cannot be handle at the same time
        discardRule: 1, // take effect only when discard is true; 1 - random, 2 - first come first serve, 3 - last come first serve
        charLimit: 50,
        speed: 5000, // ms
    };

    function renderLines(num){
        var str = '';
        for(var i=0; i<num; i++){
            str += track;
        }
        u.elm(container).innerHTML = str;
    }

    var bulletText = {
        init: function(opt){
            extendObj(options, opt);
            w.width = u.elm(options.container).innerWidth;
        },
        fire: function(bullets){},
    };

    if(typeof define != 'undefined' && define.amd){
        return bulletText;
    } else {
        window.bulletText = bulletText;
    }
});
