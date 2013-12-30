var account = (function ($, io) {
    'use strict';
    function addAjaxAlert(alert, dismissable, message) {
        var html = '',
            children;
        if (dismissable) {
            html = '<div class="alert alert-' + alert + 
                ' alert-dismissable"><button type="button" class="close" ' +
                'data-dismiss="alert" aria-hidden="true">&times;</button> ' +
                '<strong>' + message + '</strong></div>';
        } else {
            html = '<div class="alert alert-' + alert + '>' +
                '<strong>' + message + '</strong></div>';
        }
        $('.ajax-alerts').prepend(html);
        children = $('.ajax-alerts').children();
        if (children.length > 1) {
            setTimeout(function () {
                children.eq(1).fadeOut('slow', function () {
                    $(this).remove();
                });
            }, 3000)
        }
    }

    function addSocketAlert(alert, message) {

    }

    var socket = io.connect('http://localhost:3000/');
    socket.on('connect', function () {
        socket.emit('subscribe', 'alerts');
    });
    socket.on('alert', function (alert, message) {
        addSocketAlert(alert, message);
    });
    $('#user-form').submit(function (event) {
        var form = $(this);
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: form.serialize()
        }).done(function () {
            addAjaxAlert('success', true, 'Username successfully changed!');
            form.each(function () {
                this.reset();
            });
        }).fail(function (jqXHR, textStatus, errorThrown) {
            addAjaxAlert('danger', true, 'Failed to update username - ' + 
                jqXHR.responseText
            );
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
            addAjaxAlert('success', true, 'Password successfully changed!');
        }).fail(function (jqXHR, textStatus, errorThrown) {
            addAjaxAlert('danger', true, 'Failed to update password - ' +
                jqXHR.responseText
            );
        });
        event.preventDefault();
    })
    return {
        socket: socket
    };
}(jQuery, io));