import { immerable } from 'immer';

export class RequestOrderModel {
    /**
     * @hidden
     */
    [immerable] = true;

    readonly account: string;
    readonly accountOther: string;
    readonly mdNumber: string;
    readonly vendorName: string;
    readonly newVendor?: VendorModel;
    readonly purpose: string;
    readonly shippingDestination: string;
    readonly deliveryAttentionTo: string;
    readonly comments?: string;
    readonly errorMsg?: string;
    readonly errors?: any;

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
}

export class LineItemModel {
    /**
     * @hidden
     */
    [immerable] = true;

    readonly item: string;
    readonly controlledSubstance: boolean = false;
    readonly itemUnit: string;
    readonly quantity: number;
    readonly unitPrice: number;
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