var index = (function () {
    var socket = io.connect('http://localhost:3000'),
        running;
    socket.on('connect', function () {
        socket.emit('subscribe', 'data');
    });
    socket.on('status', function (status) {
        running = status;
    });
    socket.on('data', function (data) {
        $('#liquid').html(data.sensor1);
        $('#gas').html(data.sensor2);
    });
    return {
        socket: socket,
        status: running
    };
}());


$(function () {
    var gasModal = $('#gas-modal'),
        liquidModal = $('#liquid-modal'),
        colorModal = $('#color-modal'),
        gasStore = {type: 'Gas Temperature Sensor'},
        liquidStore = {type: 'Liquid Temperature Sensor'},
        colorStore = {};

    function saveForm(storage, self) {
        self.find('input').each(function () {
            if ($(this).attr('type') === 'checkbox') {
                storage[$(this).attr('name')] = $(this).prop('checked');
            } else {
                storage[$(this).attr('name')] = $(this).val();
            }
        });
        self.find('select').each(function () {
            storage[$(this).attr('name')] = $(this).val();
        });
    }

    function restoreForm(storage, self) {
        self.find('input, select').each(function () {
            var type = $(this).attr('type'),
                name = $(this).attr('name');
            if (type === 'checkbox') {
                $(this).prop('checked', storage[name]);
            } else {
                $(this).val(storage[name]);
            }
        });
    }

    // Initialize stores by saving forms.
    saveForm(gasStore, gasModal);
    saveForm(liquidStore, liquidModal);
    saveForm(colorStore, colorModal);

    // Bind event listeners.
    $('#start').click(function () {
        var data = {},
            main = $('#main-form').serializeArray();

        for (var i = 0; i < main.length; ++i) {
            data[main[i].name] = main[i].value;
        }
        data.camera = colorStore;
        data.sensors = [];
        data.sensors.push(gasStore);
        data.sensors.push(liquidStore);
        $.ajax({
            type: 'post',
            url: '/experiment',
            data: data
        }).done(function (jqXHR) {
            console.log(jqXHR);
        }).fail(function (jqXHR) {
            addDismissibleAlert('danger',
                jqXHR.responseText,
                $('#ajax-alerts'));
        });
    });
    gasModal.find('#save').click(function () {
        saveForm(gasStore, gasModal);
    });
    gasModal.find('#cancel').click(function () {
        restoreForm(gasStore, gasModal);
    });

    liquidModal.find('#save').click(function () {
        saveForm(liquidStore, liquidModal);
    });
    liquidModal.find('#cancel').click(function () {
        restoreForm(liquidStore, liquidModal);
    });

    colorModal.find('#save').click(function () {
        saveForm(colorStore, colorModal);
    });
    colorModal.find('#cancel').click(function () {
        restoreForm(colorStore, colorModal);
    });

    $('#liquid-btn').click(function () {
        liquidModal.modal();
    });
    $('#gas-btn').click(function () {
        gasModal.modal();
    });
    $('#camera-btn').click(function () {
        colorModal.modal();
    });
});