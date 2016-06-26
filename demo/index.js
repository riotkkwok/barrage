window.onload = function(){
    var prefix = 0;
    var myBarrage = window.barrage;
    myBarrage.init({
        lines: 3,
        discard: false,
        cacheSize: 100,
        screenSize: 100,
        maxShot: 3,
        mode: 1,
        speed: 5000,
        debug: true
    });
    setInterval(function(){
        prefix = ++prefix % 1000;
        myBarrage.fire([
            prefix+"-1-ADDDLLLLLLLLL",
            prefix+"-2-很好1很长很长很长真的很长很长非常长非常长非常之长的超长的长长长",
            prefix+"-3-dddddhahahahddddd",
            prefix+"-4-qwertyuiop",
            prefix+"-5-不错aa",
            prefix+"-6-qpqpq",
            prefix+"-7-zzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
            prefix+"-8-xyxy",
        ]);
    }, 1000+Math.random()*1000);

    document.querySelector('#clearBtn').onclick = function(){
        myBarrage.clearAll();
    };
    document.querySelector('#clearCacheBtn').onclick = function(){
        myBarrage.clearCache();
    };
    document.querySelector('#stopBtn').onclick = function(){
        myBarrage.stop();
        document.querySelector('#stopBtn').className += ' hidden';
        document.querySelector('#resumeBtn').className = document.querySelector('#resumeBtn').className.replace(/( )?hidden/, '');
    };
    document.querySelector('#resumeBtn').onclick = function(){
        myBarrage.resume();
        document.querySelector('#resumeBtn').className += ' hidden';
        document.querySelector('#stopBtn').className = document.querySelector('#resumeBtn').className.replace(/( )?hidden/, '');
    };
};