var socket = io.connect('http://localhost:3000/a');

$(function () {
    'use strict';

    socket.on('status', function (status) {
        if (status) {
            addAlert('info',
                'Experiment running',
                $('#socket-alerts'));
        } else {
            $('#socket-alerts').empty();
        }
    });

    $('#contact-form').submit(function (event) {
        var form = $(this);
        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: form.serialize()
        }).done(function () {
            addDismissibleAlert('success', 'Contact information ' +
                'sucessfully changed!', 
                form.parents('.panel-body').find('#ajax-alerts'));
        }).fail(function (jqXHR) {
            addDismissibleAlert('danger', 'Failed to update contact ' +
                'information - ' + jqXHR.responseText, 
                form.parents('.panel-body').find('#ajax-alerts'));
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
            addDismissibleAlert('success', 'Password successfully changed!',
                form.parents('.panel-body').find('#ajax-alerts'));
            form.each(function () {
                this.reset();
            });
        }).fail(function (jqXHR) {
            addDismissibleAlert('danger', 'Failed to update password - ' +
                jqXHR.responseText, 
                form.parents('.panel-body').find('#ajax-alerts'));
        });
        event.preventDefault();
    });
});