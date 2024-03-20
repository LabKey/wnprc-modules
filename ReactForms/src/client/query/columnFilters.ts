import { FilterFn } from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';

export const isWithinRange = (row, columnId, value) => {
    const date = row.original[columnId];
    const [startDate, endDate] = value;
    const start = new Date(startDate);
    const end = new Date(endDate);
    //If one filter defined and date is null filter it
    if((start || end) && !date) return false;
    if(start && !end){
        return date.getTime() >= start.getTime()
    }else if(!start && end){
        return date.getTime() <= end.getTime()
    }else if (start && end) {
        return date.getTime() >= start.getTime() && date.getTime() <= end.getTime()
    } else return true;
};
export const textFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    // Rank the item
    const itemRank = rankItem(row.original[columnId], value);
    // Store the itemRank info
    addMeta({
        itemRank,
    })

    // Return if the item should be filtered in/out
    return itemRank.passed
}