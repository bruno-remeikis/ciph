import React, { createContext, useContext, useState } from 'react';

// Models
import { Artist } from '../models/entities/Artist';
import { Song } from '../models/entities/Song';
import { SongTag } from '../models/entities/SongTag';
import { Tag } from '../models/entities/Tag';
import { Search } from '../models/bo/Search';

/*type updated = boolean | {
    song?: Song;
    artist?: Artist;
    tag?: Tag;
    songTag?: SongTag;
};*/

type song = {
    name: String;
};

type artist = {
    name: String;
};

type updatedObj = null | Array<song | artist>;

type updated = {
    homeScreen: boolean;
    //newSongScreen: boolean;
    artistScreen: boolean;
    tagScreen: boolean;

    obj: updatedObj;
}

interface Updated2Props {
    updated2: updated;
    setUpdated2: (_: updated) => void;
}

// CONTEXT
const Updated2Context = createContext<Updated2Props | null>(null);

// PROVIDER
export const Updated2Provider: React.FC = ({ children }) =>
{
    // Valor inicial com base no localStorage
    const [updated2, setUpdated2] = useState<updated>({
        homeScreen: true,
        //newSongScreen: true,
        artistScreen: true,
        tagScreen: true,
        obj: null
    });

    // Render
    return (
        <Updated2Context.Provider
            value={{ updated2, setUpdated2 }}
        >
            {children}
        </Updated2Context.Provider>
    );
}

// HOOK
export function useUpdated2()
{
    const context = useContext(Updated2Context);

    if(!context)
        throw new Error('useUpdated must be used within an UsedProvider');

    const { updated2, setUpdated2 } = context;

    return { updated2, setUpdated2 };
}

export function setUnupdated(ctx: Updated2Props, obj: updatedObj)
{
    ctx.setUpdated2({
        homeScreen: false,
        //newSongScreen: false,
        artistScreen: false,
        tagScreen: false,
        obj,
    });
}

export function a(ctx: Updated2Props)
{
    ctx.setUpdated2({ ...ctx.updated2,  });
}