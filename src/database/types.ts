export const cols = {
    insert: '_insert_dt',
    update: '_update_dt',
}

export type Table = {
    // Nome da tabela
    table: string,
    // Colunas comuns a todas as tabelas
    id: string;
    insertDate: string,
    updateDate: string,
    // Colunas individuais
    [key: string]: string // <- Permite inserir quaisquer outros atributos ao JSON
}