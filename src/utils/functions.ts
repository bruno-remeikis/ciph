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

/**
 * @param color Cor no formato Hexadecimal ('#ffffff')
 * @returns true caso a cor contraste bem com preto e mal, ou não tão bem, com branco
 */
export function isColorLight(hex: String): Boolean
{
    const g = parseInt(hex.slice(3, 5), 16);

    return g > 255 / 2;
}

/**
 * @param color Cor no formato Hexadecimal ('#ffffff')
 * @returns Cor preta ('#000000') ou branca ('#ffffff') em Hexadecimal,
 * sendo ela a que contrasta com a cor passada no parâmetro 'color'
 */
export function getContrastColor(hex: String): string
{
    return isColorLight(hex) ? '#000000' : '#ffffff';
}

/**
 * 
 * @param hex Cor em hexadecimal no formato '#ffffff'
 * @param alpha Número decimal de 0 à 1
 * @returns Cor em RGB no formato 'rgb(255, 255, 255)' ou RGBA no formato 'rgba(255, 255, 255, 1)'
 */
export function hexToRGB(hex: String, alpha?: Number): String
{
    const r = parseInt(hex.slice(1, 3), 16),
          g = parseInt(hex.slice(3, 5), 16),
          b = parseInt(hex.slice(5, 7), 16);

    if(alpha !== undefined && alpha >= 0 && alpha <= 1) 
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    else 
        return `rgb(${r}, ${g}, ${b})`;
}