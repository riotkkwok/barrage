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
        addClass: function(elms, cln){
            var tmp;
            if(!cln || !cln.trim()){
                return;
            }
            for(var i=0; i<elms.length; i++){
                tmp = elms[i].className;
                if(tmp.split(' ').indexOf(cln) < 0){
                    elms[i].className += ' '+cln;
                }
            }
        },
        removeClass: function(elms, cln){
            var tmp;
            if(!cln || !cln.trim()){
                return;
            }
            for(var i=0; i<elms.length; i++){
                tmp = elms[i].className;
                if(tmp.split(' ').indexOf(cln) >= 0){
                    elms[i].className = tmp.replace(cln, '');
                }
            }
        },
        extendObj: function(sObj, tObj){
            for(var key in tObj){
                if(tObj.hasOwnProperty(key)){
                    sObj[key] = tObj[key];
                }
            }
        },
        limitBytes: function(str, length) {
            var totalLength = 0;
            var charCode, tmp;
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
                if(totalLength > length){
                    tmp = str.substring(0, i-1);
                    break;
                }
            }
            return tmp;
        }
    },
    w = {
        width: window.innerWidth,
    },
    tmpl = {
        track: '<div class="bulletT-track"></div>',
        // text: '<span class="bulletT-text" style="margin-left:{{left}};">{{text}}</span>',
        text: '<span class="bulletT-text ready" style="transition:{{trst}}; left:{{left}}">{{text}}</span>',
    },
    options = {
        container: '#bulletArea',
        lines: 1,
        discard: true, // discard the bullet cannot be handle at the same time
        discardRule: 0, // take effect only when discard is true; 0 - first come first serve, 1 - last come first serve, 2 - random
        charLimit: 50,
        speed: 5000, // ms
        spacing: 10, // px
    },
    lineState: {
        list: [],
        getAvailTrackIndex: function(){
            var t = [];
            for(var i=0; i<this.list.length; i++){
                this.list[i] && t.push(i);
            }
            return t;
        }
    },
    dom: {
        tracks: [],
    }
    pendingBullets = [];

    function renderTracks(num){
        var str = '';
        for(var i=0; i<num; i++){
            str += tmpl.track;
            lineState.list.push(true);
        }
        u.elm(container).innerHTML = str;
    }

    function renderBullet(str){
        str = u.limitBytes(str);
        return tmpl.text
            .replace(/\{\{trst\}\}/g, 'left 0s linear')
            .replace(/\{\{left\}\}/g, w.width+'px')
            .replace(/\{\{text\}\}/g, str);
    }

    function calcAnim(){}

    var bulletText = {
        init: function(opt){
            extendObj(options, opt);
            w.width = u.elm(options.container).innerWidth;
            renderTracks(options.lines);
            dom.tracks = u.elm(options.container+' .bulletT-track');
        },
        fire: function(bullets){
            var bl2load, 
                emptyTrack = lineState.getAvailTrackIndex();

            // to filter bullets
            if(bullets.length > emptyTrack.length){
                if(options.discard){ // to discard
                    if(options.discardRule === 0){
                        bl2load = bullets.splice(0, emptyTrack.length);
                    }else if(options.discardRule === 1){
                        bl2load = bullets.splice(-1*emptyTrack.length);;
                    }else{
                        // TODO
                    }
                }else{ // no discard
                    bl2load = bullets.splice(0, emptyTrack.length);
                    pendingBullets = bullets;
                }
            }else{
                bl2load = [].concat(bullets);
            }

            // to load bullets
            for(var i=0; i<emptyTrack.length; i++){
                dom.tracks[emptyTrack[i]].innerHTML += renderBullet(bl2load.shift());
                lineState.list[emptyTrack[i]] = false;
            }

            // to fire bullets
            setTimeout(function(){
                var tmpL, tmpT, bl = u.elm(options.container+' .bulletT-text.ready');
                for(var i=0; i<bl.length; i++){
                    tmpL = -1 * bl[i].clientWidth + options.spacing;
                    tmpT = -1*tmpL / (w.width / options.speed) + options.speed;
                    bl[i].style.cssText += 'transition-duration: ' + (tmpT / 1000).toFixed(2) + 's; left: ' + tmpL +'px;';
                    u.removeClass(bl[i], 'ready');
                }
            }, 0);

            return bl2load;
        },
    };

    if(typeof define != 'undefined' && define.amd){
        return bulletText;
    } else {
        window.bulletText = bulletText;
    }
});
