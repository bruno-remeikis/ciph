import React, { createContext, useContext, useState } from 'react';
import { Song } from '../models/Song';

type updated = boolean | Song;

interface UpdateProps {
    updated: updated;
    setUpdated: (_: updated) => void;
}

// CONTEXT
const UpdatedContext = createContext<UpdateProps | null>(null);

// PROVIDER
export const UpdatedProvider: React.FC = ({ children }) =>
{
    // Valor inicial com base no localStorage
    const [updated, setUpdated] = useState<updated>(false);

    // Render
    return (
        <UpdatedContext.Provider
            value={{ updated, setUpdated }}
        >
            {children}
        </UpdatedContext.Provider>
    );
}

// HOOK
export function useUpdated()
{
    const context = useContext(UpdatedContext);

    if(!context)
        throw new Error('useUpdated must be used within an UsedProvider')

    const { updated, setUpdated } = context;

    return { updated, setUpdated };
}