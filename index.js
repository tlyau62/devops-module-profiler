// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://nexifyhk.visualstudio.com/NexToreV3/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require      https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js
// @grant        none
// ==/UserScript==

jQuery.noConflict();

(function($) {
    'use strict';

    $.noConflict();

    console.log('不要成日誤會我, 好嗎?');

    const mapping = {
        'BD-EPS-Frontend': '',
        'ECMCommon': 'NexTore.ECM.Common',
        'ECMECF': 'NexTore.ECM.ECF',
        'ECMeCounter': 'NexTore.ECM.eCounter',
        'ECMeDirectory': 'NexTore.ECM.eDirectory',
        'ECMPlanViewer': 'NexTore.ECM.PlanViewer',
        'EPSeProcessing': 'NexTore.EPS.eProcessing',
        'ESHRegistration': 'NexTore.ESH.Registration',
        'ESSeCounter': 'NexTore.ESS.eCounter',
        'FormToPdf': '',
        'NexToreV3Repo': '',
        'Viewer.Pas': 'NexTore.Viewer.Pas'
    };

    const artifactFiller = ()=>$('.ms-List-surface:first .ms-List-page > [role=presentation]').toArray().map(artifact=>({
        alias: $(artifact).find('.flat-view-text-preserve').text(),
        tfsEnhancements: $(artifact).find('.combo[id^="vss_"]').data().tfsEnhancements,
        option() {
            return this.tfsEnhancements[0]
        },
        dataSource() {
            return this.option()._behavior._dataSource._source
        },
        dataSourceDetails() {
            return this.dataSource().map(dataSource=>({
                dataSource,
                parts: dataSource.split('_')
            })).map(dataSource=>({
                dataSource: dataSource.dataSource,
                version: dataSource.parts[2],
                alias: dataSource.parts[0],
                branch: dataSource.parts[1]
            }))
        },
        input() {
            return $(this.option()._input)
        },
        setInput(val) {
            this.input().val(val);
            this.input().trigger('change');
        },
        latestVersion() {
            const map = mapping[this.alias];
            const dataSource = this.dataSourceDetails();
            const target = dataSource.find(d=>d.alias === map) || dataSource[0];

            return target.dataSource;
        },
        setVersion() {
            this.setInput(this.latestVersion());
        }
    }))

    window.filler = () => artifactFiller().forEach(artifact => artifact.setVersion());
})(jQuery);