import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';

var Unit = require('../../../loader/unit-loader');
var Supplier = require('../../../loader/garment-supplier-loader');
var Category = require('../../../loader/garment-category-loader');

@inject(Router, Service)
export class List {
    constructor(router, service) {
        this.service = service;
        this.router = router;
    }

    tableOptions = {
        search: false,
        showToggle: false,
        showColumns: false
    }

    Values() {
        this.arg.dateFrom = this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : null;
        this.arg.dateTo = this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : null;
        this.arg.purchaseOrderExternalNo = this.purchaseOrderExternalNo ? this.purchaseOrderExternalNo : null;
        this.arg.supplierId = this.supplier ? this.supplier._id : null;
        this.arg.categoryId = this.category ? this.category._id : null;
        this.arg.unitId = this.unit ? this.unit._id : null;
    }


    listDataFlag = false;

    columns = [
        { field: "no", title: "No.", sortable: false },
        { field: "prDate", title: "Tanggal Purchase Request" },
        { field: "prNo", title: "No. Purchase Request" },
        { field: "unit", title: "Unit" },
        { field: "division", title: "Divisi" },
        { field: "refNo", title: "No. Ref. Purchase Request" },
        { field: "category", title: "Kategori" },
        { field: "productName", title: "Nama Barang" },
        { field: "productCode", title: "Kode Barang" },
        { field: "productDesc", title: "Keterangan Barang" },
        { field: "defaultQuantity", title: "Jumlah Barang" },
        { field: "defaultUom", title: "Satuan Barang" },
        { field: "budgetPrice", title: "Harga Budget" },
        { field: "pricePerItem", title: "Harga Satuan Beli" },
        { field: "pricePerItem", title: "Harga Total" },
        { field: "supplierCode", title: "Kode Supplier" },
        { field: "supplierName", title: "Nama Supplier" },
        { field: "poIntCreatedDate", title: "Tanggal Terima PO Internal" },
        { field: "poExtNo", title: "No. PO Eksternal" },
        { field: "poExtDate", title: "Tanggal PO Eksternal" },
        { field: "poExtExpectedDeliveryDate", title: "Tanggal Target Datang" },
        { field: "deliveryOrderNo", title: "No. Surat Jalan" },
        {
            field: "deliveryOrderUseCustoms", title: "Dikenakan Bea Cukai",
            formatter: function (value, row, index) {
                return value ? "Ya" : "Tidak";
            }
        },
        { field: "supplierDoDate", title: "Tanggal Surat Jalan" },
        { field: "deliveryOrderDate", title: "Tanggal Datang Barang" },
        { field: "deliveryOrderDeliveredQuantity", title: "Jumlah Barang Datang" },
        { field: "defaultUom", title: "Satuan" },
        { field: "customsNo", title: "No. Bea Cukai" },
        { field: "customsDate", title: "Tanggal Bea Cukai" },
        { field: "unitReceiptNoteNo", title: "No. Bon Terima Unit" },
        { field: "unitReceiptNoteDate", title: "Tanggal Bon Terima Unit" },
        { field: "unitReceiptNoteDeliveredQuantity", title: "Jumlah Barang Diterima" },
        { field: "unitReceiptDeliveredUom", title: "Satuan Barang Diterima" },
        { field: "invoiceNo", title: "No. Invoice" },
        { field: "invoiceDate", title: "Tanggal Invoice" },
        {
            field: "invoiceUseIncomeTax", title: "Dikenakan PPN",
            formatter: function (value, row, index) {
                return value ? "Ya" : "Tidak";
            }
        },
        { field: "invoiceIncomeTaxNo", title: "No. PPN" },
        { field: "invoiceIncomeTaxDate", title: "Tanggal PPN" },
        { field: "incomeValue", title: "Nilai PPH" },
        {
            field: "invoiceUseVat", title: "Dikenakan PPH",
            formatter: function (value, row, index) {
                return value ? "Ya" : "Tidak";
            }
        },
        { field: "invoiceVat", title: "Jenis PPH" },
        { field: "invoiceVatNo", title: "No. PPH" },
        { field: "invoiceVatDate", title: "Tanggal PPH" },
        { field: "vatValue", title: "Nilai PPH" },
        { field: "interNoteNo", title: "No. Nota Intern" },
        { field: "interNoteDate", title: "Tanggal Nota Intern" },
        { field: "interNoteValue", title: "Nilai Nota Intern" },
        { field: "interNoteDueDate", title: "Tanggal Jatuh Tempo" },
        { field: "correctionNo", title: "No. Koreksi", sortable: false },
        { field: "correctionDate", title: "Tanggal Koreksi", sortable: false },
        { field: "correctionPriceTotal", title: "Nilai Koreksi", sortable: false },
        { field: "correctionRemark", title: "Ket. Koreksi", sortable: false },
        { field: "remark", title: "Keterangan" },
        { field: "status", title: "Status" }
    ]

    loader = (info) => {
        var order = {};

        if (info.sort)
            order[info.sort] = info.order;

        this.arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            keyword: info.search,
            order: order
        };

        return this.listDataFlag ? (
            this.Values(),
            this.service.search(this.arg)
                .then(result => {
                    return {
                        total: result.info.total,
                        data: result.data,
                    }
                })
        ) : { total: 0, data: {} };
    }

    ExportToExcel() {
        this.Values();
        this.service.generateExcel(this.arg);
    }

    search() {
        this.listDataFlag = true;
        this.table.refresh();
    }

    get unitLoader() {
        return Unit;
    }

    get supplierLoader() {
        return Supplier;
    }

    get categoryLoader() {
        return Category;
    }

    reset() {
        this.purchaseOrderExternalNo = "";
        this.unit = "";
        this.category = "";
        this.supplier = "";
        this.dateFrom = null;
        this.dateTo = null;
        this.listDataFlag = false;
        this.table.refresh();
    }

}