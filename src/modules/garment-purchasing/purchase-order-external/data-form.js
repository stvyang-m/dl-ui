import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
import { Service } from "./service";
var SupplierLoader = require('../../../loader/garment-supplier-loader');
var CurrencyLoader = require('../../../loader/currency-loader');
var VatLoader = require('../../../loader/vat-loader');

@containerless()
@inject(Service, BindingEngine)
export class DataForm {
    @bindable readOnly = false;
    @bindable data = {};
    @bindable error = {};
    @bindable title;
    @bindable selectedSupplier;
    @bindable selectedCurrency;
    @bindable selectedVat;
    @bindable options = { isUseIncomeTax: false };
    keywords = ''

    termPaymentImportOptions = ['T/T PAYMENT', 'CMT', 'FREE FROM BUYER', 'SAMPLE'];
    termPaymentLocalOptions = ['DAN LIRIS', 'CMT', 'FREE FROM BUYER', 'SAMPLE'];
    typePaymentOptions = ['CASH', 'T/T AFTER', 'T/T BEFORE'];
    categoryOptions = ['FABRIC', 'ACCESSORIES']
    qualityStandardTypeOptions = ['JIS', 'AATC','ISO']

    label = "Periode Tgl. Shipment"
    freightCostByOptions = ['Penjual', 'Pembeli'];
    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 5
        }
    }

    items = {
        columns: [
            "Nomor PR - Nomor Referensi PR",
            "Nomor RO",
            "Barang",
            "Jumlah Diminta",
            "Satuan Diminta",
            "Jumlah Beli",
            "Satuan Beli",
            "Konversi",
            "Harga Satuan",
            "Include Ppn?",
            "Keterangan"],
        onRemove: function () {
            this.bind();
        }
    };

    constructor(service, bindingEngine) {
        this.service = service;
        this.bindingEngine = bindingEngine;
    }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        this.isItem = false;

        if (this.data.category) {
            if (this.data.category === "FABRIC") {
                this.isFabric = true;
            }
            else {
                this.isFabric = false;
            }
        }
        else {
            this.isFabric = true;
        }

        if (this.data.items.length > 0) {
            this.isItem = true;
        }

        this.options.readOnly = this.readOnly;
        if (this.data.useIncomeTax) {
            this.options.isUseIncomeTax = true;
        }
    }

    @computedFrom("data._id")
    get isEdit() {
        return (this.data._id || '').toString() != '';
    }

    @computedFrom("data.supplierId")
    get supplierType() {
        if (this.data.supplier) {
            if (this.data.supplier.import)
                return "Import"
            else
                return "Lokal"
        }
        else
            return "Lokal"
    }

    @computedFrom("data.supplierId")
    get supplierIsImport() {
        if (this.data.supplier) {
            if (this.data.supplier.import)
                return true
            else
                return false
        }
        else
            return false
    }

    selectedSupplierChanged(newValue) {
        var _selectedSupplier = newValue;
        if (_selectedSupplier._id) {
            this.data.supplier = _selectedSupplier;
            this.data.supplierId = _selectedSupplier._id ? _selectedSupplier._id : "";
        }
    }

    selectedCurrencyChanged(newValue) {
        var _selectedCurrency = newValue;
        if (_selectedCurrency._id) {
            var currencyRate = parseInt(_selectedCurrency.rate ? _selectedCurrency.rate : 1, 10);
            this.data.currency = _selectedCurrency;
            this.data.currencyRate = currencyRate;
        }
        else {
            this.data.currencyRate = 0;
        }
    }

    categoryChanged(e) {
        var selectedCategory = e.srcElement.value;
        if (selectedCategory) {
            this.data.category = selectedCategory;

            this.data.qualityStandard.shrinkage = '';
            this.data.qualityStandard.wetRubbing = '';
            this.data.qualityStandard.dryRubbing = '';
            this.data.qualityStandard.washing = '';
            this.data.qualityStandard.darkPrespiration = '';
            this.data.qualityStandard.lightMedPrespiration = '';
            this.data.qualityStandard.pieceLength = '';
            this.data.qualityStandard.qualityStandardType = 'JIS';

            if (this.data.category === "FABRIC") {
                this.isFabric = true;
            }
            else {
                this.isFabric = false;
            }
        }
    }

    paymentMethodChanged(e) {
        var selectedPayment = e.srcElement.value;
        if (selectedPayment) {
            this.data.paymentMethod = selectedPayment;
        }
    }

    paymentTypeChanged(e) {
        var selectedPayment = e.srcElement.value;
        if (selectedPayment) {
            this.data.paymentType = selectedPayment;
            if (this.data.paymentType == "CASH" || this.data.paymentType == "T/T BEFORE") {
                this.data.paymentDueDays = 0;
            }
        }
    }

    selectedVatChanged(newValue) {
        var _selectedVat = newValue;
        if (!_selectedVat) {
            this.data.vatRate = 0;
            this.data.useVat = false;
            this.data.vat = {};
        } else if (_selectedVat._id) {
            this.data.vatRate = _selectedVat.rate ? _selectedVat.rate : 0;
            this.data.useVat = true;
            this.data.vat = _selectedVat;
        }
    }

    useIncomeTaxChanged(e) {
        var selectedUseIncomeTax = e.srcElement.checked || false;
        if (!selectedUseIncomeTax) {
            this.options.isUseIncomeTax = false;
            for (var poItem of this.data.items) {
                poItem.useIncomeTax = false;
                poItem.pricePerDealUnit = poItem.priceBeforeTax;
            }
        } else {
            this.options.isUseIncomeTax = true;
        }
    }

    get supplierLoader() {
        return SupplierLoader;
    }

    get currencyLoader() {
        return CurrencyLoader;
    }

    get vatLoader() {
        return VatLoader;
    }

    supplierView = (supplier) => {
        return `${supplier.code} - ${supplier.name}`
    }

    currencyView = (currency) => {
        return currency.code
    }

    vatView = (vat) => {
        return `${vat.name} - ${vat.rate}`
    }

    async search() {
        var result = await this.service.searchByTags(this.keywords, this.context.shipmentDateFrom, this.context.shipmentDateTo);

        var items = result.data.map((data) => {
            return {
                poNo: data.no,
                poId: data._id,
                prNo: data.purchaseRequest.no,
                prId: data.purchaseRequest._id,
                prRefNo: data.items.refNo,
                roNo: data.roNo,
                productId: data.items.productId,
                product: data.items.product,
                categoryId: data.items.category._id,
                category: data.items.category,
                defaultQuantity: Number(data.items.defaultQuantity),
                defaultUom: data.items.defaultUom,
                dealQuantity: Number(data.items.defaultQuantity),
                dealUom: data.items.defaultUom,
                budgetPrice: Number(data.items.budgetPrice),
                priceBeforeTax: Number(data.items.budgetPrice),
                pricePerDealUnit: Number(data.items.budgetPrice),
                conversion: 1,
                useIncomeTax: false,
                remark: data.items.remark
            }
        })
        items = [].concat.apply([], items);
        this.data.items = items;
        this.isItem = true;
    }

} 