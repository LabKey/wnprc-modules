export class NewProtocolForm {
    id: string;
    approval_date: Moment;

    constructor() {

    }

    static fromJSON(json: {[key: string]: string}): NewProtocolForm {
        let obj: NewProtocolForm = new NewProtocolForm();

        obj.id = json['id'];
        obj.approval_date = moment(json['approval_date']);

        return obj;
    }
}