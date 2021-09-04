import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabase('ciph.db');

/*
EXEMPLO:
https://medium.com/@thekingoftech/como-configurar-o-sqlite-expo-no-react-native-1d160e04b652
*/