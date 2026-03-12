import React, { createContext, useContext, useState, useCallback } from "react";

interface AIMasterclass2RegisterModalContextType {
    isOpen: boolean;
    openRegisterModal: () => void;
    closeRegisterModal: () => void;
}

const AIMasterclass2RegisterModalContext = createContext<AIMasterclass2RegisterModalContextType>({
    isOpen: false,
    openRegisterModal: () => { },
    closeRegisterModal: () => { },
});

export const useAIMasterclass2RegisterModal = () => useContext(AIMasterclass2RegisterModalContext);

export const AIMasterclass2RegisterModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openRegisterModal = useCallback(() => setIsOpen(true), []);
    const closeRegisterModal = useCallback(() => setIsOpen(false), []);

    return (
        <AIMasterclass2RegisterModalContext.Provider value={{ isOpen, openRegisterModal, closeRegisterModal }}>
            {children}
        </AIMasterclass2RegisterModalContext.Provider>
    );
};
