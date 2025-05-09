import { StringHelper, Grid } from './grid.module.js';
import Restaurant from './lib/Restaurant.js';

const grid = new Grid({
    appendTo  : 'grid',
    ui        : 'plain',
    flex      : '1 1 100%',
    rowHeight : 60,

    features : {
        sort     : 'restaurant',
        cellEdit : {
            autoSelect : false,
            autoEdit   : true // Feature that starts editing when typing with a focused cell
        },
        cellCopyPaste : true, // Feature that enables copying and pasting of cell contents
        rowCopyPaste  : {
            useNativeClipboard : true
        },
        // Feature that adds a fill handle to extend cell content into a larger range
        fillHandle : true
    },

    // Useful selection mode configs for spreadsheet like behaviour
    selectionMode : {
        cell       : true,
        checkbox   : true,
        dragSelect : true
    },

    columns : [
        {
            text       : 'Restaurant',
            field      : 'restaurant',
            readOnly   : true,
            htmlEncode : false,
            width      : 180,
            renderer({ record }) {
                return `${StringHelper.encodeHtml(record.restaurant)}<br><small><i class="b-fa b-fa-location-dot"></i>${StringHelper.encodeHtml(record.location)}</small>`;
            }
        },
        {
            text       : 'Customer review',
            field      : 'review',
            flex       : 2,
            autoHeight : true
        },
        {
            text       : 'Response',
            field      : 'response',
            flex       : 2,
            autoHeight : true
        },
        {
            text  : 'Food item',
            field : 'foodItem',
            flex  : 1
        },
        {
            text  : 'Sentiment',
            field : 'sentiment',
            flex  : 1
        },
        {
            text  : 'Notes',
            field : 'notes',
            flex  : 1
        }
    ],

    store : {
        modelClass : Restaurant,
        readUrl    : '/api/reviews',
        createUrl  : '/api/review/create',
        updateUrl  : '/api/review/update',
        deleteUrl  : '/api/review/delete',
        autoLoad   : true,
        autoCommit : true,
        onBeforeRequest(args) {
            const { body } = args;
            if (!body?.data?.length) return;

            const FIELDS = ['response', 'foodItem', 'sentiment', 'notes'];

            // Look for the first record that contains an empty object in one of the fields
            const emptyObjectField = body.data.find(record =>
                FIELDS.some(field => {
                    const v = record[field];
                    return v &&
                           typeof v === 'object' &&
                           !Array.isArray(v) &&
                           Object.keys(v).length === 0;
                })
            );

            if (emptyObjectField) {
                // Throwing  aborts the request in Bryntum
                throw new Error('Update cancelled: empty object detected in response / foodItem / sentiment / notes');
            }
        }
    }
});
