import { immerable } from 'immer';

export class RequestOrderModel {
    /**
     * @hidden
     */
    [immerable] = true;

    readonly rowId?: number;
    readonly account: string;
    readonly accountOther: string;
    readonly vendor: string; //rowId of ehr_purchasing.vendor
    readonly newVendor?: VendorModel = VendorModel.create();
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

    static create(raw?: any): RequestOrderModel {
        return new RequestOrderModel({ ...raw });
    }
}
export class PurchaseAdminModel {
    /**
     * @hidden
     */
    [immerable] = true;

    readonly rowId?: number;
    readonly assignedTo: string;
    readonly creditCardOption: string;
    readonly qcState: number;
    readonly program: string = '4';
    readonly confirmationNum?: string;
    readonly invoiceNum?: string;
    readonly errorMsg?: string;
    readonly errors?: any;


    constructor(values?: Partial<PurchaseAdminModel>) {
        Object.assign(this, values);
    }

    static create(raw?: any): PurchaseAdminModel {
        return new PurchaseAdminModel({ ...raw });
    }
}

export class VendorModel {
    /**
     * @hidden
     */
    [immerable] = true;

    readonly rowId?: number;
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

    static create(raw?: any): VendorModel {
        return new VendorModel({ ...raw });
    }

    static getDisplayString(vendorModel: VendorModel) : string {
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

    readonly rowId?: number;
    readonly requestRowId?: number;
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

    static create(raw?: any): LineItemModel {
        return new LineItemModel({ ...raw });
    }
}