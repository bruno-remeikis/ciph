export function groupConcat(strs: string[]): string
{
    let returnStr = '';

    strs.forEach((str, i) =>
    {
        returnStr += str;

        if(i < strs.length - 1)
            returnStr += ', ';
    });

    return returnStr;
}

export const dbDatetimeFormat = (dt: string): string =>
    `strftime('%Y-%m-%dT%H:%M:%S', ${dt})`;