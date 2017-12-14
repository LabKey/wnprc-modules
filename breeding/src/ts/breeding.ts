declare const LABKEY: any;
declare const Ext4: any;
import * as $ from 'jquery';

export class Breeding {
    private PLACEHOLDER: string = 'placeholder.view?id=';

    public displayPregnancyGrid(gridElementId: string, detailElementId: string) {
        const x = new LABKEY.QueryWebPart({
            detailsURL: `/breeding/${this.PLACEHOLDER}\${objectid}`,
            queryName: 'pregnancies_current',
            schemaName: 'study',
            showDetailsColumn: true,
            success: () => {
                $(`a[href*='${this.PLACEHOLDER}']`).each((i, e) => {
                    const id = /id=([^&]+)&/.exec($(e).attr('href'))[1];
                    $(e).attr('href', 'javascript:void(0)')
                        .click(this.ondetailclick.bind(this, id, detailElementId));
                });
            },
            title: 'Current Pregnancies',
        });
        x.render(gridElementId);
        this.ondetailclick(null, detailElementId);
    }

    public displayPregnancyDetail(webpart: { id: string | null, wrapperDivId: string }) {
        if (webpart.id) {
            Ext4.create('Ext.panel.Panel', {
                bodyStyle: 'background: transparent',
                border: false,
                frame: false,
                items: [
                    {
                        flex: 1,
                        margin: '0 10 0 0',
                        showBackBtn: false,
                        store: {
                            filterArray: [LABKEY.Filter.create('objectid', webpart.id, LABKEY.Filter.Types.EQUAL)],
                            queryName: 'pregnancies_current',
                            schemaName: 'study',
                        },
                        title: `Pregnancy Detail`,
                        xtype: 'ldk-detailspanel',
                    },
                    {
                        border: false,
                        flex: 4,
                        frame: false,
                        xtype: 'panel',
                    },
                ],
                layout: {
                    align:  'stretch',
                    type:   'hbox',
                },
                renderTo: webpart.wrapperDivId,
            });
        } else {
            $(`#${webpart.wrapperDivId}`).empty();
        }
    }

    private ondetailclick(id: string | null, detailElementId: string) {
        const x = new LABKEY.WebPart({
            partConfig: { id },
            partName:   'Pregnancy Detail',
            renderTo:   detailElementId,
        });
        x.render();
    }
}
export default new Breeding();
