var $ = require('jquery')
var addCommas = require('add-commas')

// The global jQuery instance is used by some posts
window.$ = window.jQuery = $

$(document).ready(function () {
  function describeInDetail () {
    return botui.message.add({
      loading: true,
      delay: 1000,
      content: 'Cool !! 😎'
    }).then(function () {
      return botui.message.add({
        loading: true,
        delay: 2000,
        content: "I've always been interested in design and development. I believe for most of the products, both of these go hand in hand."
      })
    }).then(function () {
      return botui.message.add({
        loading: true,
        delay: 3000,
        content: 'Because of this enthusiasm towards tech & UX I have come across wide variety of technologies and projects, which I try to update here on this website.'
      })
    }).then(function () {
      return botui.message.add({
        loading: true,
        delay: 5000,
        content: 'Crap 😱'
      })
    }).then(function () {
      return botui.message.add({
        loading: true,
        delay: 3000,
        content: 'Server on fire🔥🔥🔥'
      })
    }).then(function () {
      return botui.message.add({
        loading: true,
        delay: 500,
        content: 'GTG!!'
      })
    }).then(function () {
      return botui.message.add({
        loading: true,
        delay: 3000,
        content: 'Meanwhile, feel free to explore the website.'
      })
    }).then(function () {
      return botui.message.add({
        loading: true,
        delay: 1000,
        content: 'byee 👋'
      })
    })
  }

  function wrapUpShort () {
    return botui.message.add({
      loading: true,
      delay: 1000,
      content: '<br>😔 Okay!!<br>'
    }).then(function () {
      return botui.message.add({
        loading: true,
        delay: 2000,
        content: '![](https://send.ewebdesign.com/source/59f83dc6cea7e/come.gif?1509453577048) It seems you are in a hurry! <br>Feel free to explore website or drop me a mail at [hi@varunest.com](mailto:hi@varunest.com)'
      })
    })
  }

  // If this is homepage, get view count for all posts
  if ($('body').hasClass('home')) {
    // $.ajax({
    //   type: 'GET',
    //   url: '/views/total',
    //   dataType: 'json',
    //   success: function (data) {
    //     var views = addCommas(data.views)
    //     $('.views').text(views)
    //   },
    //   error: function (data) {
    //     $('.views').text('Lots of')
    //   }
    // })
    require('./botui')

    var botui = new BotUI('chat-box')

    botui.message.add({
      content: 'Hi there  👋'
    }).then(function () { // wait till previous message has been shown.
      return botui.message.add({
        content: 'My name is Varun and most of my time is spent designing and developing stuff. Do you wish to know more about me?'
      })
    }).then(function () {
      return botui.action.button({
        human: true,
        action: [
          {
            text: 'Yes 👍',
            value: 1
          },
          {
            text: 'Shut up already! 😷',
            value: 2
          }
        ]
      })
    }).then(function (res) {
      if (res.value === 1) {
        return describeInDetail()
      } else {
        return wrapUpShort()
      }
    })
  } else if ($('body').hasClass('blog-index')) {
    $('#nav-blog').addClass('active')
  }

  // If this is a post, get post view count
  if ($('body').hasClass('post')) {
    var slug = $('.views').data('slug')
    if (!slug) return console.error('missing view slug')
    if (slug[slug.length - 1] === '/') slug = slug.slice(0, slug.length - 1)
    $.ajax({
      type: 'POST',
      url: '/views',
      data: {
        slug: slug
      },
      dataType: 'json',
      success: function (data) {
        var views = addCommas(data.views)
        $('.views').text(views + ' views')
      },
      error: function (data) {
        $('.views').text('Lots of views')
      }
    })
  }

  if ($('body').hasClass('about')) {
    var ageInDays = Math.floor((new Date() - new Date('1990-10-29T00:00:01.000Z')) / 1000 / 60 / 60 / 24)
    var ageInYears = Math.floor(ageInDays / 365)
    $('#ageInDays').html(' &mdash; that\'s ' + ageInDays + ' days to be exact!')
    $('#ageInYears').text(ageInYears)
  }
})

var $window = $(window)

// scroll to footer when contact is clicked
$('#nav-contact').on('click', function (e) {
  e.preventDefault()
  e.stopPropagation()
  $('html, body').animate({
    scrollTop: $('#footer').offset().top - 30
  }, 'slow')
})

// stick navbar
var $header = $('#header')
var $brandComma = $('#brand-comma')
var $footerLights = $('#footer-background .lights')
var $footerLaptop = $('#footer-background .laptop')
var $footerCoffee = $('#footer-background .coffee')

var onScrollOrResize = function (event) {
  // var windowHeight = $window.height()
  // var windowWidth = $window.width()
  var dft = $window.scrollTop()
  var dfb = $(document).height() - $(window).height() - $(document).scrollTop()

  if ($('body').hasClass('home')) {
    $('#main-image').css('transform', 'translateY(-' + dft / 5 + 'px)');
  }

  if (dft >= 54) {
    $header.addClass('sticky')
    $brandComma.hide(200)
  } else if (dft < 54) {
    $header.removeClass('sticky')
    $brandComma.show(200)
  }

  $footerLaptop.css('transform', 'translate(-' + dfb / 10 + 'px,' + dfb / 8 + 'px)')
  $footerCoffee.css('transform', 'translate(' + 0 + 'px,' + dfb / 8 + 'px)')
  $footerLights.css('transform', 'translateY(-' + dfb / 10 + 'px)')
}

window.addEventListener('scroll', onScrollOrResize)
window.addEventListener('resize', onScrollOrResize)
onScrollOrResize()

// Fade animation
var i = 0
var t = 0
$(function () {
  $('.fade').each(function () {
    i++
    $(this).attr('data-index', i);
  });
});


function fade (t) {
  t++;
  $('[data-index=' + t + ']').addClass('fade-ani');
  if (t <= $('.fade').length) {
    setTimeout(function () {
      fade(t)
    }, t * 10 + 100)
  }
}

$(function () {
  fade(t);
});
