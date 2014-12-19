var userHtml;
$(document).ready(function (argument) {
  var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
  var isIos = navigator.userAgent.toLowerCase().indexOf("iphone") > -1;
  var modal = $('.modal');
  var article = $('article');
  var canClick = false

  modal.removeClass("open");
  article.removeClass("blur");
  
  if (isIos) {
    $('.modal a').attr("href", "itms://appstore.com/apps/apple").text('download')
  } else if (isAndroid) {
    $('.modal a').attr("href", "com.lets.android").text('download')
  } else {
    $('.modal a').attr("href", "http://www.lets.bz").text('Get the app.')
  }
  
  $('.modal a').click(function(event) {
    console.log('CLICKED');
    modal.removeClass("open");
    article.removeClass("blur");
  });

  userHtml = $($('.guestlist >>').get().filter(function(li) {
      return $(li).text() == user.name;
    })[0]);

  $('.rsvp').on('touchstart click', function(e) {
    if (accepted) {
      $.ajax({
        type: "POST",
        url: '/leave',
        data: { key: key },
        success: function (foo) {
          $('.rsvp a').text('Join');
          userHtml.appendTo($('#noReply'));
          accepted = false;
        }
      });
    } else {
      $.ajax({
        type: "POST",
        url: '/Join',
        data: { key: key },
        success: function (foo) {
          $('.rsvp a').text('Leave')
          userHtml.appendTo($('#interested'));
          accepted = true;
        }
      });
      setTimeout(function() {
        modal.addClass("open");
        article.addClass("blur");
      }, 0);
    }
  });
});