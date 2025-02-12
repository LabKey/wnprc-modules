export const zeroPadName = (num, places) => {return(String(num).padStart(places, '0'))};

export const parseRoomItemNum = (input: string): number => {
    const regex = /\w+-(\d+)/; // matches "string-number"

    const match = input.match(regex);
    if (match) { // if a match return the number
        return parseInt(match[1]);
    }
    return;
}

export const parseRoomItemType = (input: string): string => {
    const regex = /^(\w+)-\d+$/; // matches "string-number"

    const match = input.match(regex);
    if (match) { // if a match return the type/string
        return match[1];
    }
    return;
}

export const getTypeClassFromElement = (element) => {
    const classes: string[] = Array.from(element.classList);

    // Define a regex to capture the part after "type-"
    const regex = /^type-(\w+)/;

    // Find the class that matches the regex and capture the relevant part
    const typeClass = classes.find(cls => regex.test(cls));

    if (typeClass) {
        const match = typeClass.match(regex);
        return match[1]; // Return only the captured part (after "type-")
    }

    return null;
}


export const parseLongId = (input: string) => {
    const regex = /\w+-\w+-(\d+)/; // matches "string-string-number"

    const match = input.match(regex);
    if (match) { // if a match return the number
        return parseInt(match[1]);
    }
    return;
}

export const parseSeparator = (input: string): string | null => {
    const match = input.match(/^([^-]+)/); // matches and returns out the first word before a "-"
    return match ? match[0] : null;
}


export const convertToTitleCase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}



export const cleanString = (name: string) => {
    return name.toLowerCase().replace(/[\s-]/g, '');
}
