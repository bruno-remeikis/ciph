import React, { createContext, useContext, useState } from 'react';

// Models
import { Artist } from '../models/entities/Artist';
import { Song } from '../models/entities/Song';
import { SongTag } from '../models/entities/SongTag';
import { Tag } from '../models/entities/Tag';

type updated = boolean | {
    song?: Song;
    artist?: Artist;
    tag?: Tag;
    songTag?: SongTag;
};

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
        throw new Error('useUpdated must be used within an UsedProvider');

    const { updated, setUpdated } = context;

    return { updated, setUpdated };
}