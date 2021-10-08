import React, { createContext, useContext, useState } from 'react';

interface MessageProps {
    pushMsg: (_: string) => void;

    /*updated: updated;
    setUpdated: (_: updated) => void;
    a: number;*/
}

// CONTEXT
const MessageContext = createContext<MessageProps | null>(null);

// PROVIDER
export const MessageProvider: React.FC = ({ children }) =>
{
    // Valor inicial com base no localStorage
    //const [updated, setUpdated] = useState<updated>(false);

    const [msgQueue, setMsgQueue] = useState<string[]>([]);

    function pushMsg(msg: string)
    {
        const auxMsgQueue = [...msgQueue];
        auxMsgQueue.push(msg);
        setMsgQueue(auxMsgQueue);
    }

    // Render
    return (
        <MessageContext.Provider
            value={{ pushMsg }}
        >
            {children}
        </MessageContext.Provider>
    );
}

// HOOK
export function useMessage()
{
    const context = useContext(MessageContext);

    if(!context)
        throw new Error('useUpdated must be used within an UsedProvider')

    return context;
}