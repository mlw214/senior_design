var archive = (function () {
    'use strict';
    function addSocketAlert(alert, message) {

    }

    var socket,
        ExperimentModel = Backbone.Model.extend({
            idAttribute: '_id',
            urlRoot: '/experiment',
            parse: function (response) {
                response.start = new Date(response.start);
                return response;
            }
        }),
        ExperimentView = Backbone.View.extend({
            tagName: 'li',
            className: 'media',
            events: {
                'click .glyphicon-remove': 'destroy'
            },
            template: _.template(
                '<a class="pull-right" href="/experiment/<%= _id %>/' +
                    'download"><span class="glyphicon glyphicon-save">' +
                    '</span></a><span class="glyphicon glyphicon-remove ' +
                    'pull-right"></span><div class="media-body">' +
                    '<h4 class="media-heading"><%= name %></h4><p>' +
                    '<%= description %></p><p><small>Start: <%= start %> ' +
                    'Completed: <%= stop %></small></p></div>'
            ),
            initialize: function () {
                this.listenTo(this.model, 'change', this.render);
                this.listenTo(this.model, 'destroy', this.remove);
                this.listenTo(this.model, 'hide', this.remove);
            },
            destroy: function () {
                this.model.destroy();
            },
            render: function () {
                this.$el.html(this.template(this.model.attributes));
                return this;
            },
            remove: function () {
                this.$el.remove();
            }
        }),
        ExperimentList = Backbone.Collection.extend({
            url: '/experiment',
            model: ExperimentModel,
            comparator: function (model1, model2) {
                return model1.get('start') < model2.get('start');
            },
            initialize: function () {
                this.on('remove', this.hideModel);
            },
            hideModel: function (model) {

                model.trigger('hide');
            }
        }),
        ExperimentListView = Backbone.View.extend({
            tagName: 'ul',
            className: 'media-list',
            collection: ExperimentList,
            initialize: function () {
                this.listenTo(this.collection, 'add', this.addOne);
                this.listenTo(this.collection, 'reset', this.addAll);
                this.listenTo(this.collection, 'sort', this.addAll);
            },
            addOne: function (experiment) {
                var experimentView = new ExperimentView({ model: experiment });
                this.$el.append(experimentView.render().el);
            },
            addAll: function () {
                this.$el.empty();
                this.collection.forEach(this.addOne, this);
            },
            render: function () {
                this.addAll();
            }
        }),
        collection = new ExperimentList(),
        collectionView = new ExperimentListView({ collection: collection });


    socket = io.connect('http://localhost:3000');
    socket.on('alert', function (alert, message) {
        addSocketAlert(alert, message);
    });
    collection.fetch();


    return {
        socket: socket,
        model: ExperimentModel,
        view: ExperimentView,
        collection: collection,
        collectionView: collectionView
    };
}());

$(function () {
    $('#experiments').html(archive.collectionView.el);
});