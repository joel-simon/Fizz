var userHtml;
$(document).ready(function (argument) {
<<<<<<< HEAD
    userHtml = $('.guestlist >>').get().filter(function(li){
        return $(li).text() == user.name;
    })[0]

    $(".rsvp a").on('touchstart click', function(e) {
        if (accepted && confirm('Leave this event?')) {
            console.log('test');
            $.ajax({
                type: "POST",
                url: '/leave',
                data: { key: key },
                success: function (foo) {
                    console.log($('.rsvp h1'));
                    $('.noReply').append(userHtml)
                    $('.rsvp h1').text('Click anywhere to join')
                    accepted = false;
                },
                fail: function(err){
                    console.log('there was an error', err);
                }
            });
        } else if (confirm('Join this event?')) {
            $.ajax({
                type: "POST",
                url: '/Join',
                data: { key: key },
                success: function (foo) {
                    $('.rsvp h1').text('You are attending')
                    $('.interested').append(userHtml)
                    accepted = true;
                }
            });
            
            // Open modal
            $(".modal").addClass("open");
        }
    });
    
    $(".modal").on("touchstart click", function(e) {
        $(this).removeClass("open");
    });
=======
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
      setTimeout(function() {
        modal.show()
      }, 500);
    }
  });
>>>>>>> master
});