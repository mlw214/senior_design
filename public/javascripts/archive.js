var archive = (function ($, io) {

    function addSocketAlert(alert, message) {

    }

    var socket = io.connect('http://localhost:3000');
    socket.on('connect', function () {
        socket.emit('subscribe', 'alerts');
    });
    socket.on('alert', function (alert, message) {
        addSocketAlert(alert, message);
    });

    var ExperimentModel = Backbone.Model.extend({
        idAttribute: '_id',
        urlRoot: '/experiment'
    });

    var ExperimentView = Backbone.View.extend({
        tagName: 'li',
        className: 'media',
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },
        render: function () {
            this.$el.html('<p>' + this.model.attributes + '</p>');
        },
        remove: function () {
            this.$el.remove();
        }
    });
    var ExperimentList = Backbone.Collection.extend({
        model: ExperimentModel,
        url: '/experiment'
    });
    var ExperimentListView = Backbone.View.extend({
        tagName: 'ul',
        className: 'media-list'

    });


    return {
        socket: socket,
        ExperimentModel: ExperimentModel,
        ExperimentView: ExperimentView
    };
}(jQuery, io));