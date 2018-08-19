$(document).ready(function() {

  $(".delete-btn").click(function(event) {
    event.preventDefault();

    const thisId = $(this).attr("data-id");
  
    $.ajax(`/remove/${thisId}`, {
      type: "PUT",
    })
    .then(function() {
        location.reload();
    });
  });

  $(".note-btn").click(function (event) {
    event.preventDefault();
    const id = $(this).attr("data");
    $('#article-id').text(id);
    $('#save-note').attr('data', id);
    $.ajax(`/articles/${id}`, {
        type: "GET"
    }).then(function (data) {
        $('.articles-available').empty();
        if (data[0].note.length > 0) {
            data[0].note.forEach(v => {
                $('.articles-available').append($(`<li class='list-group-item'>${v.text}<button type='button' class='btn btn-danger btn-sm float-right btn-deletenote' data='${v._id}'>X</button></li>`));
            })
        } else {
            $('.articles-available').append($(`<li class='list-group-item'>No notes for this article yet</li>`));
        }
    })
    $('#note-modal').modal('toggle');
  });

  $('.btn-deletenote').click(function (event) {
    event.preventDefault();
    const id = $(this).attr("data");
    $.ajax(`/note/${id}`, {
        type: "DELETE"
    }).then(function () {
        $('#note-modal').modal('toggle');
    });
  })

  $("#save-note").click(function (event) {
    event.preventDefault();
    const id = $(this).attr('data');
    const noteText = $('#note-input').val().trim();
    $('#note-input').val('');
    $.ajax(`/note/${id}`, {
        type: "POST",
        data: {
            text: noteText
        }
    }).then(function (data) {
        console.log(data)
    })
    $('#note-modal').modal('toggle');
  });

  $(".save-btn").click(function (event) {
    event.preventDefault();
    const button = $(this);
    const id = button.attr("id");
    $.ajax(`/save/${id}`, {
        type: "PUT"
    }).then(function () {
        const alert = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
        This article has been saved.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        </div>`
        button.parent().append(alert);
    });
  });

  $(".navbar-nav .nav-link").click(function () {
    $(".navbar-nav .nav-link").removeClass("active");
    $(this).addClass("active");
  })

})