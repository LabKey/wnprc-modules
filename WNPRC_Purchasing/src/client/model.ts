import { immerable } from 'immer';

export class RequestOrderModel {
    /**
     * @hidden
     */
    [immerable] = true;

    readonly account: string;
    readonly accountOther: string;
    readonly vendor: string; //rowId of ehr_purchasing.vendor
    readonly newVendor?: VendorModel = VendorModel.create({});
    readonly purpose: string;
    readonly shippingDestination: number; //rowId of ehr_purchasing.shippingInfo
    readonly deliveryAttentionTo: string;
    readonly comments?: string;
    readonly errorMsg?: string;
    readonly errors?: any;
    readonly qcState?: number;

    constructor(values?: Partial<RequestOrderModel>) {
        Object.assign(this, values);
    }

    static create(raw: any, defaultSettings = null): RequestOrderModel {
        if (defaultSettings) {
            return new RequestOrderModel({ ...defaultSettings });
        } else {
            return new RequestOrderModel({ ...raw });
        }
    }
}

export class VendorModel {
    /**
     * @hidden
     */
    [immerable] = true;

    readonly vendorName: string;
    readonly streetAddress: string;
    readonly city: string;
    readonly state: string;
    readonly country: string;
    readonly zip: string;
    readonly phoneNumber?: string;
    readonly faxNumber?: string;
    readonly email?: string;
    readonly url?: string;
    readonly notes?: string;
    readonly errorMsg?: string;
    readonly errors?: any;
    readonly qcState?: number;

    constructor(values?: Partial<VendorModel>) {
        Object.assign(this, values);
    }

    static create(raw: any, defaultSettings = null): VendorModel {
        if (defaultSettings) {
            return new VendorModel({ ...defaultSettings });
        } else {
            return new VendorModel({ ...raw });
        }
    }

    static getDisplayVersion(vendorModel: VendorModel) : string {
        let newVendorStr = '';
        newVendorStr += vendorModel.vendorName ? ('Vendor name: ' + vendorModel.vendorName + "\n") : '';
        newVendorStr += vendorModel.streetAddress ? ('Street address: ' + vendorModel.streetAddress + "\n") : '';
        newVendorStr += vendorModel.city ? ('City: ' + vendorModel.city + "\n") : '';
        newVendorStr += vendorModel.state ? ('State: ' + vendorModel.state + "\n") : '';
        newVendorStr += vendorModel.zip ? ('Zip: ' + vendorModel.zip + "\n") : '';
        newVendorStr += vendorModel.country ? ('Country: ' + vendorModel.country + "\n") : '';
        newVendorStr += vendorModel.phoneNumber ? ('Phone number: ' + vendorModel.phoneNumber + "\n") : '';
        newVendorStr += vendorModel.faxNumber ? ('Fax Number: ' + vendorModel.faxNumber + "\n") : '';
        newVendorStr += vendorModel.email ? ('Email: ' + vendorModel.email+ "\n") : '';
        newVendorStr += vendorModel.url ? ('Company website: ' + vendorModel.url + "\n") : '';
        newVendorStr += vendorModel.notes ? ('Notes: ' + vendorModel.notes + "\n") : '';
        return newVendorStr;
    }
}

export class LineItemModel {
    /**
     * @hidden
     */
    [immerable] = true;

    readonly item: string;
    readonly controlledSubstance: boolean = false;
    readonly itemUnit: number; //rowId of ehr_purchasing.itemUnits
    readonly quantity: number;
    readonly unitCost: number;
    readonly subTotal: number = 0;
    readonly status?: string;
    readonly errors?: any;

    constructor(values?: Partial<LineItemModel>) {
        Object.assign(this, values);
    }

    static create(raw: any, defaultSettings = null): LineItemModel {
        if (defaultSettings) {
            return new LineItemModel({ ...defaultSettings });
        } else {
            return new LineItemModel({ ...raw });
        }
    }
}