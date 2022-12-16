export const dateFormat = 'dd/MM/yyyy H:mm';

export const colors = {
    //background: '#F3E0EC',
    background: '#FAFAFA',
    //background2: 'rgb(251, 243, 239)',
    background2: 'rgba(217, 136, 89, 0.08)',

	primary: 'rgb(217, 136, 89)',
    primaryRGB: '217, 136, 89',

    text: '#0f0f0f',

    red: 'rgb(230, 50, 39)',
    redLight: 'rgb(255, 136, 130)',
    redLightRGB: '255, 136, 130',

    inputBorder: 'rgba(0, 0, 0, 0.2)',
}

export const opacities = {
    disabled: 0.50,
}

export const sizes = {
    screenPadding: 18,
}

/**
 * Colocar "elevation: 2" manualmente ou
 * utilizar o componente Fade passando
 * "property: 'elevation'" e passando 2
 * para "value" ("initial" ou "final")
 * 
 * https://ethercreative.github.io/react-native-shadow-generator/
 */
export const shadow = {
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 1,
    },
    shadowRadius: 1.41,
    shadowOpacity: 0.2,
    // elevation: 2,
}