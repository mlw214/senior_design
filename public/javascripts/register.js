$(function () {
    'use strict';
    $('form').submit(function (event) {
        var form = $(this);
        $('#ajax-alerts').empty();
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: form.serialize()
        }).done(function () {
            window.location.href = 'http://' + window.location.host + '/login';
        }).fail(function (jqXHR) {
            addAlert('danger',
                jqXHR.responseText,
                $('#ajax-alerts'));
        });
        event.preventDefault();
    });
});