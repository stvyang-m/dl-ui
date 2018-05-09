import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
var moment = require('moment');
var UnitLoader = require('../../../loader/unit-loader');
var CategoryLoader = require('../../../loader/category-loader');

@inject(Router, Service)
export class List {

    constructor(router, service) {
        this.service = service;
        this.router = router;
        this.today = new Date();
        this.data=[];
    }
    attached() {
    }

    activate() {
    }

    view(data) {
        this.router.navigateToRoute('view', { id: data._id });
    }

    search() {
        var dateFormat = "DD MMM YYYY";
        var locale = 'id-ID';
        var moment = require('moment');
        moment.locale(locale);
            this.service.search(this.unit ? this.unit._id : "", this.category ? this.category._id : "", this.dateFrom, this.dateTo)
            .then(data => {
                this.data = data;
            })
    }

    reset() {
        this.unit = "";
        this.category = "";
        this.dateFrom = null;
        this.dateTo = null;
        this.data = [];
    }

    exportToXls() {
        this.service.generateExcel(this.unit ? this.unit._id : "", this.category ? this.category._id : "", this.dateFrom, this.dateTo);
    }

    dateFromChanged(e) {
        var _startDate = new Date(e.srcElement.value);
        var _endDate = new Date(this.dateTo);
        this.dateMin = moment(_startDate).format("YYYY-MM-DD");

        if (_startDate > _endDate || !this.dateTo) {
            this.dateTo = e.srcElement.value;
        }

    }

    get unitLoader() {
        return UnitLoader;
    }

    get categoryLoader() {
        return CategoryLoader;
    }

}