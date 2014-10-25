var userHtml;
$(document).ready(function (argument) {
  userHtml = $($('.guestlist >>').get().filter(function(li){
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
    }
  });
});