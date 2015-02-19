var c3 = require('c3');
var m = require('mithril');
var $osf = require('osfHelpers');

var Stats = {};

function getSourcesOneCol(raw_data) {
    var source_data = raw_data['sources']['buckets'];
    var chart_list = [];

    for (i = 0; i < source_data.length; i++){
        var new_item = [];
        new_item.push(source_data[i]['key']);
        new_item.push(source_data[i]['doc_count']);
        chart_list.push(new_item);
    }

    return chart_list;
}

Stats.view = function(ctrl) {
    return [
        m('.row', {style: {color: 'darkgrey'}}, [
            m('.col-md-4', m('p.text-center', ctrl.vm.latestDate ? ctrl.vm.totalCount + ' events as of ' + ctrl.vm.latestDate : '')),
            m('.col-md-4', m('p.text-center', ctrl.vm.query().length > 0 ? 'Found ' + ctrl.vm.count + ' events in ' + ctrl.vm.time + ' seconds' : '')),
            m('.col-md-4', m('p.text-center', ctrl.vm.providers + ' content providers'))
        ]),
        m('.row', ctrl.vm.showStats ? [
            m('col-md-12', [
                m('.row', m('.col-md-12', [
                    m('h1.about-share-header', {
                        class: 'animated fadeInUp'
                    },'What is SHARE?'),
                    m('div[id=shareDoughnutGraph]', {config: ctrl.drawDoughnutGraph})
                ]))
            ]),
        ] : []),
        m('.row', [
            m('col-md-12', m('a.stats-expand', {
                onclick: function() {ctrl.vm.showStats = !ctrl.vm.showStats;}
            },
                ctrl.vm.showStats ? m('i.icon-angle-up') : m('i.icon-angle-down')
            ))
        ])
    ];
};

Stats.controller = function(vm) {
    var self = this;

    self.vm = vm;
    self.vm.providers = 26;

    self.vm.totalCount = 0;
    self.vm.showStats = true;
    self.vm.latestDate = undefined;

    self.drawDoughnutGraph = function(e, i) {
        if (i) return;

        var chart2 = c3.generate({
            bindto: '#shareDoughnutGraph',
            data: {
                columns: getSourcesOneCol(self.vm.statsData),
                type : 'donut',
            },
            donut: {
                title: 'SHARE Providers'
            }
        });
    };

    m.request({
        method: 'GET',
        url: '/api/v1/share/?size=1',
        background: true
    }).then(function(data) {
        self.vm.totalCount = data.count;
        self.vm.latestDate = new $osf.FormattableDate(data.results[0].dateUpdated).local;
    });

    m.request({
        method: 'GET',
        url: '/api/v1/share/stats/'
    }).then(function(data) {
        self.vm.statsData = data;
    });
};

module.exports = Stats;
