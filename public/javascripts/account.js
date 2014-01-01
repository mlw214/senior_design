var account = (function () {
    'use strict';
    function addAjaxAlert(alert, message, self) {
        var html = '<div class="alert alert-' + alert +
                        ' alert-dismissable"><button type="button" ' +
                        'class="close" data-dismiss="alert" aria-hidden=' +
                        '"true">&times;</button><strong>' + message +
                        '</strong></div>',
            children;
        $(self).parents('.panel-body').find('#ajax-alerts').prepend(html);
        children = $(self).parents('.panel-body').find('#ajax-alerts').
            children();
        if (children.length > 1) {
            setTimeout(function () {
                children.eq(1).fadeOut('slow', function () {
                    $(this).remove();
                });
            }, 3000)
        }
    }

    function addSocketAlert(alert, message, self) {

    }

    var socket = io.connect('http://localhost:3000/');
    socket.on('alert', function (alert, message) {
        addSocketAlert(alert, message);
    });
    return {
        socket: socket,
        addAjaxAlert: addAjaxAlert,
        addSocketAlert: addSocketAlert
    };
}());

$(function () {
    'use strict';
    $('#contact-form').submit(function (event) {
        var form = $(this);
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: form.serialize()
        }).done(function () {
            account.addAjaxAlert('success', 'Contact information ' +
                'sucessfully changed!', form);
        }).fail(function (jqXHR) {
            account.addAjaxAlert('danger', 'Failed to update contact ' +
                'information - ' + jqXHR.responseText, form);
        });
        event.preventDefault();
    });
    $('#user-form').submit(function (event) {
        var form = $(this);
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: form.serialize()
        }).done(function (jqXHR) {
            account.addAjaxAlert('success', 'Username successfully changed!',
                form
                );
            form.each(function () {
                this.reset();
            });
            $('h2 small').text('for ' + jqXHR);
        }).fail(function (jqXHR) {
            account.addAjaxAlert('danger', 'Failed to update username - ' +
                jqXHR.responseText, form);
        });
        event.preventDefault();
    });
    $('#pass-form').submit(function (event) {
        var form = $(this);
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: form.serialize()
        }).done(function () {
            account.addAjaxAlert('success', 'Password successfully changed!',
                form);
            form.each(function () {
                this.reset();
            });
        }).fail(function (jqXHR) {
            account.addAjaxAlert('danger', 'Failed to update password - ' +
                jqXHR.responseText, form);
        });
        event.preventDefault();
    });
});