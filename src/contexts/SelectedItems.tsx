import React, { createContext, useContext, useState } from 'react';
import { Vibration } from 'react-native';

// Models
import { Search } from '../models/bo/Search';

/**
 * Caso null: não está em modo de seleção;
 * Caso lista vazia: está em modo de seleção, porém sem nenhum item selecionado;
 * caso lista com itens: está em modo de seleção e existem itens selecionados.
 */
type selectedItems = Search[] | null;

interface SelectedItemsProps {
    selectedItems: selectedItems;
    setSelectedItems: (_: selectedItems) => void;
}

// CONTEXT
const SelectedItemsContext = createContext<SelectedItemsProps | null>(null);

// PROVIDER
export const SelectedItemsProvider: React.FC = ({ children }) =>
{
    // Valor inicial com base no localStorage
    const [selectedItems, setSelectedItems] = useState<selectedItems>(null);

    // Render
    return (
        <SelectedItemsContext.Provider
            value={{ selectedItems, setSelectedItems }}
        >
            {children}
        </SelectedItemsContext.Provider>
    );
}

// HOOK
export function useSelectedItems()
{
    const context = useContext(SelectedItemsContext);

    if(!context)
        throw new Error('useSelectedItems must be used within an SelectedItemsProvider');

    const { selectedItems, setSelectedItems } = context;

    return { selectedItems, setSelectedItems };
}

export function addSelectedItem(ctx: SelectedItemsProps, searchItem: Search)
{
    if(ctx.selectedItems == null)
    {
        ctx.setSelectedItems([searchItem]);
        Vibration.vibrate(100);
    }
    else
        ctx.setSelectedItems([...ctx.selectedItems, searchItem]);
}

export function removeSelectedItem(ctx: SelectedItemsProps, searchItem: Search)
{
    if(ctx.selectedItems != null)
    {
        if(ctx.selectedItems.length === 1)
        {
            if(ctx.selectedItems[0].type === searchItem.type && ctx.selectedItems[0].id === searchItem.id)
                ctx.setSelectedItems(null);
        }
        else
            ctx.setSelectedItems(ctx.selectedItems.filter(item =>
                item.type !== searchItem.type || item.id !== searchItem.id
            ));
    }
}

/*export function isSelecting(): boolean
{
    const { selectedItems, setSelectedItems } = useSelectedItems();

    return 
}*/