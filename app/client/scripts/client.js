var userHtml;
$(document).ready(function (argument) {
  var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
  var isIos = navigator.userAgent.toLowerCase().indexOf("iphone") > -1;
  var modal = $('.modal');
  var canClick = false

  modal.hide();

  if (isIos) {
    $('.modal a').attr("href", "itms://appstore.com/apps/apple").text('get the ios app')
  } else if (isAndroid) {
    $('.modal a').attr("href", "com.lets.android").text('get the android app')
  }
  
  $('.modal a').click(function(event) {
    console.log('CLICKED');
    modal.hide();
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
        modal.show()
      }, 500);
    }
  });
});