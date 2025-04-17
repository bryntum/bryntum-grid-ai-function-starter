import { StringHelper, Grid, Toast, Panel } from './grid.module.js';
import Restaurant from './lib/Restaurant.js';

const grid = new Grid({
    appendTo         : 'grid',
    ui               : 'plain',
    flex             : '1 1 100%',
    rowHeight        : 60,
    // When user types =AI( into a cell editor, a base FormulaProvider will be created with this config
    // It will send a request to the configured URL with the body and the formula.
    // The `content` property from JSON response will be used to update the cell value.
    formulaProviders : {
        AI : {
            url  : '/formulaPrompt',
            body : {
                max_tokens : 100
            },
            // We can augment the resulting prompt with a listener when the formula changes
            // Add the extra text from the setting panel to the formula
            onFormulaChange(event) {
                event.formula = `${event.formula}. ${grid.settingsPanel.widgetMap.extra.value}`;
                event.source.body.temperature = Math.round(grid.settingsPanel.widgetMap.temperature.value * 10) / 10;
            }

            ,onFormulaNetworkError({ response }) {
                Toast.show({
                    html : `<h2>AIFormula network error: ${response.statusText}</h2>
                              <code>${response.url}</code>
                              <p>Please ensure that the url is correct and that the server is running.`,
                    timeout : 3000
                });
            }
        }
    },

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
            formula    : true,
            text       : 'Response',
            field      : 'response',
            flex       : 2,
            tooltip    : 'Try typing =AI(Write a nice response to the customer who left this review: $review)',
            autoHeight : true
        },
        {
            formula : true,
            text    : 'Food item',
            field   : 'foodItem',
            tooltip : 'Try typing =AI(extract the food item from $review)',
            flex    : 1
        },
        {
            formula : true,
            text    : 'Sentiment',
            field   : 'sentiment',
            tooltip : 'Try typing =AI(Extract the sentiment from $review as one word)',
            flex    : 1
        },
        {
            formula       : true,
            text          : 'Notes',
            field         : 'notes',
            flex          : 1,
            headerWidgets : [{
                type    : 'button',
                style   : 'order:1',
                tooltip : 'Show settings panel',
                icon    : 'b-fa b-fa-cog',
                cls     : 'b-transparent',
                onClick : 'up.onSettingsClick'
            }]
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
        onBeforeRequest({ body }) {
            if (!body?.data) return;
            const { data } = body;
            const { response, foodItem, sentiment, notes } = data[0];
            if (typeof response === 'object') {
                body.data[0].response = '';
            }
            if (typeof foodItem === 'object') {
                body.data[0].foodItem = '';
            }
            if (typeof sentiment === 'object') {
                body.data[0].sentiment = '';
            }
            if (typeof notes === 'object') {
                body.data[0].notes = '';
            }
        }
    },

    onPaint({ firstPaint }) {
        if (firstPaint) {
            const savedSettings = localStorage.getItem('globalPromptSettings');
            const settings = savedSettings ? JSON.parse(savedSettings) : {
                globalPrompt : `Please return the result using the language of ${this.localeManager.locale.localeCode}. If message indicates just one word or number, character, image, or emoji is requested, return just *one* such item, and no extra text.`,
                temperature  : 1.0
            };
            if (!savedSettings) {
                this.saveGlobalPrompt(settings);
            }

            this.settingsPanel = new Panel({
                drawer   : true,
                width    : '37em',
                title    : 'Settings',
                defaults : {
                    labelWidth : '10em'
                },
                items : {
                    extra : {
                        type     : 'textarea',
                        height   : '15em',
                        label    : 'Global Prompt Suffix',
                        value    : settings.globalPrompt,
                        onChange : ({ value }) => this.saveGlobalPrompt({ globalPrompt : value })
                    },
                    temperature : {
                        type     : 'slider',
                        flex     : '1 0 100%',
                        label    : 'Temperature',
                        min      : 0,
                        max      : 2,
                        step     : 0.1,
                        value    : settings.temperature,
                        onChange : ({ value }) => this.onTemperatureChange(value),

                        showTooltip : true
                    }
                }
            });
        }
    },

    onSettingsClick() {
        const { settingsPanel } = this;
        settingsPanel[settingsPanel.isVisible ? 'hide' : 'show']();
    },

    saveGlobalPrompt(updates) {
        const currentSettings = JSON.parse(localStorage.getItem('globalPromptSettings') || '{}');

        const newSettings = {
            ...currentSettings,
            ...updates
        };

        localStorage.setItem('globalPromptSettings', JSON.stringify(newSettings));
    },

    onTemperatureChange(value) {
        // Adjust configuration block, which is used by all instances
        const roundedValue = Math.round(value * 10) / 10;
        this.formulaProviders.AI.body.temperature = roundedValue;
        this.saveGlobalPrompt({ temperature : roundedValue });
    }
});