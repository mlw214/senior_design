var socket = io.connect('http://localhost:3000/da');
$(function () {
    'use strict';
    var gasModal = $('#gas-modal'),
        liquidModal = $('#liquid-modal'),
        colorModal = $('#color-modal'),
        gasStore = { type: 'Gas Temperature Sensor' },
        liquidStore = { type: 'Liquid Temperature Sensor' },
        colorStore = {},
        id, operatingMode;

    function saveForm(storage, self) {
        self.find('input, select').each(function () {
            if ($(this).attr('type') === 'checkbox') {
                storage[$(this).attr('name')] = $(this).prop('checked');
            } else {
                storage[$(this).attr('name')] = $(this).val();
            }
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

    function prepareData() {
        var data = {},
            main = $('#main-form').serializeArray();

        for (var i = 0; i < main.length; ++i) {
            data[main[i].name] = main[i].value;
        }
        data.camera = colorStore;
        data.sensors = [];
        data.sensors.push(gasStore);
        data.sensors.push(liquidStore);
        return data;
    }

    function restoreExperiment(experiment) {
        var main = $('#main-form');
        main.find('#name').val(experiment.name);
        main.find('#period').val(experiment.rate);
        main.find('textarea').val(experiment.description);
        main.find('#' + experiment.contact).prop('checked', true);

        // Restore modal forms.
    }

    // Initialize stores by saving forms.
    saveForm(gasStore, gasModal);
    saveForm(liquidStore, liquidModal);
    saveForm(colorStore, colorModal);

    // Bind event listeners.
    $('#start').click(function () {
        var data = prepareData();
        $.ajax({
            type: 'post',
            url: '/experiment',
            data: data
        }).done(function (jqXHR) {
            id = jqXHR._id;
        }).fail(function (jqXHR) {
            addDismissibleAlert('danger',
                jqXHR.responseText,
                $('#ajax-alerts'));
        });
    });
    $('#update').click(function () {
        var data = prepareData();
        $.ajax({
            type: 'put',
            url: '/experiment/' + id,
            data: data
        }).done(function () {
            addDismissibleAlert('success',
                'Experiment updated',
                $('#ajax-alerts'));
        }).fail(function (jqXHR) {
            addDismissibleAlert('danger',
                jqXHR.responseText,
                $('#ajax-alerts'));
        });
    });
    $('#stop').click(function () {
        $.ajax({
            type: 'put',
            url: '/experiment/' + id,
            data: {
                stop: Date.now(),
                cancelled: false
            }
        }).done(function (jqXHR) {
            id = null;
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

    socket.on('data', function (data) {
        $('#liquid').html(data.liquid);
        $('#gas').html(data.gas);
    });
    socket.on('status', function (status) {
        if (status) {
            // Experiment running.
            // Rest of UI changes handled by 'mode' event.
            addAlert('info',
                'Experiment running',
                $('#socket-alerts'));
        } else {
            // No experiment running.
            // Handle differently based on operating mode.
            if (operatingMode) {
                $('#update').addClass('hidden');
                $('#start').removeClass('hidden');
                $('#stop').prop({ disabled: true });
                $('#name').prop({ disabled: false });
                id = null;
                operatingMode = false;
            } else {
                $('#start').prop({ disabled: false });
                $('#stop').prop({ disabled: false });
                $('#cancel').prop({ disabled: false });
                $('#relay').prop({ disabled: false });
            }  
            $('#socket-alerts').empty();
        }
    });
    socket.on('experimentID', function (eid) {
        id = eid;
        $.ajax({
            type: 'get',
            url: '/experiment/' + id,
        }).done(function (jqXHR) {
            restoreExperiment(jqXHR);
        }).fail(function (jqXHR) {
            // Need to handle failure.
            console.log(jqXHR);
        });
    });
    socket.on('mode', function (mode) {
        operatingMode = mode;
        if (mode) {
            $('#update').removeClass('hidden');
            $('#start').addClass('hidden');
            $('#stop').prop({ disabled: false });
            $('#name').prop({ disabled: true });
        } else {
            $('#start').prop({ disabled: true });
            $('#stop').prop({ disabled: true });
            $('#cancel').prop({ disabled: true });
            $('#relay').prop({ disabled: true });
        }
        console.log(operatingMode);
    });
});