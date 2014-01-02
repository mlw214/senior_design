var login = (function () {
    function addAjaxAlert(message) {
        var html = '<div class="alert alert-danger">' + message + '</div>';
        $('#ajax-alerts').html(html);
    }

    return {
        addAlert: addAjaxAlert
    };
}());

$(function () {
    'use strict';
    $('form').submit(function (event) {
        var form = $(this);
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: form.serialize()
        }).done(function () {
            window.location.href = 'http://' + window.location.host + '/login';
        }).fail(function (jqXHR) {
            login.addAlert(jqXHR.responseText);
        });
        event.preventDefault();
    });
});