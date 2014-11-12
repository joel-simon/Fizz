var userHtml;
$(document).ready(function (argument) {
  var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
  var isIos = navigator.userAgent.toLowerCase().indexOf("ios") > -1;
  
  alert(navigator.userAgent.toLowerCase())
  // alert({ios:isIos, android:isAndroid})
  
  if (isIos) {
    $('.modal a').attr("href", "itms://appstore.com/apps/apple").text('get the ios app')
  } else if (isAndroid) {
    $('.modal a').attr("href", "com.lets.android").text('get the android app')
  }

  // $('.modal').click(function(){$('.modal').hide()});

  
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
          console.log($('.rsvp h1'));
          $('.rsvp a').text('Join Event');
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
          $('.rsvp a').text('Leave Event')
          userHtml.appendTo($('#interested'));
          accepted = true;
        }
      });
      $('.modal').show()
      setTimeout(function(){
        $('.modal').click(function(){$('.modal').hide()});
      }, 500);
    }
  });
});