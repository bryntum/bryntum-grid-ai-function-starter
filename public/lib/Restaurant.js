import { GridRowModel } from '../grid.module.js';

export default class Restaurant extends GridRowModel {
    static fields = [
        { name : 'restaurant' },
        { name : 'location' },
        { name : 'review' },
        { name : 'response' },
        { name : 'foodItem' },
        { name : 'sentiment' },
        { name : 'notes' }
    ];
}
