import React, { createContext, useContext, useState } from 'react';

// Models
import { Song } from '../models/entities/Song';
import { Tag } from '../models/entities/Tag';

type currentTag = null | {
    tag: Tag;
    songList: Song[];
};

interface CurrentTagProps {
    currentTag: currentTag;
    setCurrentTag: (_: currentTag) => void;
}

// CONTEXT
const CurrentTagContext = createContext<CurrentTagProps | null>(null);

// PROVIDER
export const CurrentTagProvider: React.FC = ({ children }) =>
{
    // Valor inicial com base no localStorage
    const [currentTag, setCurrentTag] = useState<currentTag>(null);

    // Render
    return (
        <CurrentTagContext.Provider
            value={{ currentTag, setCurrentTag }}
        >
            {children}
        </CurrentTagContext.Provider>
    );
}

// HOOK
export function useCurrentTag()
{
    const context = useContext(CurrentTagContext);

    if(!context)
        throw new Error('useCurrentTag must be used within an UsedProvider');

    const { currentTag, setCurrentTag } = context;

    return { currentTag, setCurrentTag };
}