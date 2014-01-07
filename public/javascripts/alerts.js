function addDismissibleAlert(alert, message, elem) {
    var html = '<div class="alert alert-' + alert +
                    ' alert-dismissable"><button type="button" ' +
                    'class="close" data-dismiss="alert" aria-hidden=' +
                    '"true">&times;</button><strong>' + message +
                    '</strong></div>',
        children;

    $(elem).html(html);
    children = $(elem).children();
}

function addAlert(alert, message, elem) {
    var html = '<div class="alert alert-' + alert + '">' + message + '</div>';
    $(elem).html(html);
}