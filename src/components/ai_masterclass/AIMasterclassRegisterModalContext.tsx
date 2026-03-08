import React, { createContext, useContext, useState, useCallback } from "react";

interface AIMasterclassRegisterModalContextType {
    isOpen: boolean;
    openRegisterModal: () => void;
    closeRegisterModal: () => void;
}

const AIMasterclassRegisterModalContext = createContext<AIMasterclassRegisterModalContextType>({
    isOpen: false,
    openRegisterModal: () => { },
    closeRegisterModal: () => { },
});

export const useAIMasterclassRegisterModal = () => useContext(AIMasterclassRegisterModalContext);

export const AIMasterclassRegisterModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openRegisterModal = useCallback(() => setIsOpen(true), []);
    const closeRegisterModal = useCallback(() => setIsOpen(false), []);

    return (
        <AIMasterclassRegisterModalContext.Provider value={{ isOpen, openRegisterModal, closeRegisterModal }}>
            {children}
        </AIMasterclassRegisterModalContext.Provider>
    );
};
