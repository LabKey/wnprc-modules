// /**
//  * @external Ext4
//  */
// /**
//  * @typedef {Object} Component
//  * @prop {Function} define
//  * @prop {Function} getSelectionModel
//  * @prop {Function} mon
//  */
// (function () {
//     /**
//      * Pseudo-parameterized SQL for retreiving the "current" pregnancy lsid given a participant id
//      * @type {string}
//      */
//     const GET_ACTIVE_PREGNANCY_LSID_BY_ID_SQL =
//             'select lsid \
//                from (select p.lsid \
//                            ,p.date_conception_early \
//                        from pregnancies p \
//                       where p.Id = {0} \
//                         and not exists (select * \
//                                           from pregnancy_outcomes po \
//                                          where po.pregnancyid = p.lsid) \
//                                       order by date_conception_early desc) \
//               limit 1'.replace(/\s+/g, ' ');
//
//     /**
//      * Edit event handler. Updates the pregnancy id of the passed row based on any changes to the participant id.
//      *
//      * @param sender
//      * @param {{field, value, originalValue}} args
//      * @this Component
//      * @private
//      */
//     function _onEdit(sender, args) {
//         // only worry about changes to the id field
//         if (args.field !== 'Id') return;
//         // only worry about _actual_ changes
//         if (args.value === args.originalValue) return;
//
//         const model = this.getSelectionModel().getSelection()[0];
//         if (model) {
//             // clear the pregnancy id for now, pending the result of the query
//             model.set('pregnancyid', null);
//             LABKEY.Query.executeSql({
//                 failure: function (error) {
//                     console.error('unable to retrieve default pregnancy: id=' + args.value);
//                     console.error(error.exception);
//                 },
//                 schemaName: 'study',
//                 scope: this,
//                 sql: Ext4.String.format(GET_ACTIVE_PREGNANCY_LSID_BY_ID_SQL, LABKEY.Query.sqlStringLiteral(args.value)),
//                 success: function (data) {
//                     // enqueue the update to the model so it happens on the next edit event
//                     if (data.rowCount) this.enqueueEditAction(model.set.bind(model, 'pregnancyid', data.rows[0].lsid));
//                 }
//             });
//         }
//     }
//
//     Ext4.define('WNPRC.grid.PregnancyLinkedGridPanel', {
//         extend: 'WNPRC.grid.AppendRecordGridPanel',
//         alias: 'widget.wnprc-pregnancylinkedgridpanel',
//
//         /**
//          * Initializes the panel.
//          *
//          * @override
//          */
//         initComponent: function () {
//             this.callParent(arguments);
//             this.mon(this, 'edit', _onEdit, this);
//         }
//     });
// })();