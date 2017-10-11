i = 0;
t = 0;

$(function () {
    $('.fade').each(function () {
        i++;
        $(this).attr('data-index', i);
    });
});

function fade(t) {
    t++;
    $('[data-index=' + t + ']').addClass('fade_ani');
    if (t <= $('.fade').length) {
        setTimeout(function () {
            fade(t)
        }, t * 10 + 100)
    }
}

$(function () {
    fade(t);
});