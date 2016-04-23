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
        limitBytes: function(str) {
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
                if(totalLength > options.charLimit){
                    str = str.substring(0, i-1);
                    break;
                }
            }
            return str;
        }
    },
    w = {
        width: window.innerWidth,
    },
    tmpl = {
        track: '<div class="bulletT-track"></div>',
        // text: '<span class="bulletT-text" style="margin-left:{{left}};">{{text}}</span>',
        text: '<span class="bulletT-text ready" style="transition:{{trst}}; left:{{left}}" data-initTime="{{initTime}}">{{text}}</span>',
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
    lineState = {
        list: [],
        getAvailTrackIndex: function(){
            var t = [];
            for(var i=0; i<this.list.length; i++){
                this.list[i] < (+new Date) && t.push(i);
            }
            return t;
        }
    },
    dom = {
        tracks: [],
        stylesheet: '.bulletT-track{position:relative;} .bulletT-text{position:absolute; white-space:nowrap; z-index: 10;}',
    }
    pendingBullets = [];

    function insertStyle(){
        var s = document.createElement('style');
        s.innerHTML = dom.stylesheet;
        u.elm('head')[0].appendChild(s);
    }

    function renderTracks(num){
        var str = '';
        for(var i=0; i<num; i++){
            str += tmpl.track;
            lineState.list.push(0);
        }
        u.elm(options.container)[0].innerHTML = str;
    }

    function renderBullet(str){
        str = u.limitBytes(str);
        return tmpl.text
            .replace(/\{\{initTime\}\}/g, ((new Date).getMinutes()+':'+((new Date).getSeconds())))
            .replace(/\{\{trst\}\}/g, 'left 0s linear')
            .replace(/\{\{left\}\}/g, w.width+'px')
            .replace(/\{\{text\}\}/g, str);
    }

    function shot(){
        var tmpL, tmpT, maxTime = 0, minTime = Infinity, bl = u.elm(options.container+' .bulletT-text.ready'),
            emptyTrack = lineState.getAvailTrackIndex();
        for(var i=0; i<bl.length; i++){
            tmpL = -1 * (bl[i].offsetWidth + options.spacing);
            tmpT = -1*tmpL / (w.width / options.speed) + options.speed;
            bl[i].style.cssText += 'transition-duration: ' + (tmpT / 1000).toFixed(2) + 's;';
            bl[i].style.cssText += 'left: ' + tmpL +'px;';
            maxTime = Math.max(maxTime, tmpT);
            lineState.list[emptyTrack[i]] = +new Date + tmpT - options.speed;
        }
        u.removeClass(bl, 'ready');
        setTimeout(clean, maxTime);
    }

    function clean(){
        var tmp;
        for(var i=0; i<options.lines; i++){
            tmp = u.elm(options.container+' .bulletT-track')[i];
            for(var j=0; j<tmp.childNodes.length; j++){
                if(tmp.firstChild.offsetLeft + tmp.firstChild.offsetWidth < 0){
                    tmp.firstChild.remove();
                }else{
                    break;
                }
            }
        }
    }

    var bulletText = {
        init: function(opt){
            u.extendObj(options, opt);
            w.width = u.elm(options.container)[0].offsetWidth;
            renderTracks(options.lines);
            dom.tracks = u.elm(options.container+' .bulletT-track');
            insertStyle();
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
                // dom.tracks[emptyTrack[i]].innerHTML += renderBullet(bl2load.shift());
                dom.tracks[emptyTrack[i]].appendChild(document.createDocumentFragment(renderBullet(bl2load.shift())));
            }

            // to fire bullets
            setTimeout(shot, 100);
            // shot();

            return bl2load;
        },
    };

    if(typeof define != 'undefined' && define.amd){
        return bulletText;
    } else {
        window.bulletText = bulletText;
    }
});
