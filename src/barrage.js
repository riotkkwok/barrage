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
        text: '<span class="bulletT-text ready" style="transition:{{trst}};" data-initTime="{{initTime}}">{{text}}</span>',
    },
    options = {
        container: '#bulletArea',
        lines: 3,
        discard: true, // discard the bullet cannot be handle at the same time
        discardRule: 0, // take effect only when discard is true; 0 - first come first serve, 1 - last come first serve, 2 - random
        charLimit: 50,
        speed: 5000, // ms
        spacing: 10, // px
        clean: 20, // run clean func per X bullets
    },
    lineState = {
        list: [],
        bulletInList: [],
        bulletCount: 0,
        maxTime: 0,
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
        stylesheet: '.bulletT-track{position:relative;} .bulletT-text{position:absolute; left:100%; white-space:nowrap; z-index: 10;}',
    },
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
            lineState.bulletInList.push(0);
        }
        u.elm(options.container)[0].innerHTML = str;
    }

    function renderBullet(str){
        str = u.limitBytes(str);
        return tmpl.text
            .replace(/\{\{initTime\}\}/g, ((new Date).getMinutes()+':'+((new Date).getSeconds())))
            .replace(/\{\{trst\}\}/g, 'left 0s linear')
            .replace(/\{\{text\}\}/g, str);
    }

    function shot(){
        var now = Date.now();
        var tmpL, tmpT, bl = u.elm(options.container+' .bulletT-text.ready'),
            delList = [], delCount = 0,
            emptyTrack = lineState.getAvailTrackIndex();
        for(var i=0; i<bl.length; i++){
            tmpL = -1 * (bl[i].offsetWidth + options.spacing);
            // tmpL = -1 * (parseInt(window.getComputedStyle(bl[i],null).width, 10) + options.spacing);
            tmpT = -1*tmpL / (w.width / options.speed) + options.speed;
            bl[i].style.cssText += 'transition-duration: ' + (tmpT / 1000).toFixed(2) + 's;';
            bl[i].style.cssText += 'left: ' + tmpL +'px;';
            lineState.maxTime = Math.max(lineState.maxTime, tmpT);
            lineState.list[emptyTrack[i]] = +new Date + tmpT - options.speed;
            lineState.bulletCount++;
            lineState.bulletInList[emptyTrack[i]]++;
            if(lineState.bulletCount >= options.clean){
                delCount = lineState.bulletCount;
                delList = delList.concat(lineState.bulletInList);
                clean(delCount, delList, lineState.maxTime);
                lineState.maxTime = 0;
                lineState.bulletCount = 0;
                for(var j=0; j<lineState.bulletInList.length; j++){
                    lineState.bulletInList[j] = 0;
                }
            }
        }
        u.removeClass(bl, 'ready');
        tmpL = tmpT = bl = delList = delCount = null;
        console.log(Date.now() - now);
    }

    function clean(count, list, time){ // TODO - to optimize
        setTimeout(function(){
            var tmp;
            for(var i=0; i<options.lines; i++){
                tmp = dom.tracks[i].children;
                for(var j=list[i]-1; j>=0; j--){
                    tmp[j].remove();
                }
            }
            list = null;
        }, time);
    }

    var barrage = {
        init: function(opt){
            u.extendObj(options, opt);
            w.width = u.elm(options.container)[0].offsetWidth;
            // w.width = parseInt(window.getComputedStyle(u.elm(options.container)[0],null).width, 10);
            renderTracks(options.lines);
            dom.tracks = u.elm(options.container+' .bulletT-track');
            insertStyle();
        },
        fire: function(bullets){
            var bl2load, tmpElm,
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
                tmpElm = dom.tracks[emptyTrack[i]].appendChild(document.createElement('div'));
                tmpElm.outerHTML = renderBullet(bl2load.shift());
            }

            // to fire bullets
            shot();

            return bl2load;
        },
    };

    if(typeof define != 'undefined' && define.amd){
        return barrage;
    } else {
        window.barrage = barrage;
    }
});
