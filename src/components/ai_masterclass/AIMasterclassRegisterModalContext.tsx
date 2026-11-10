import React, { createContext, useContext, useState, useCallback } from "react";

export interface OpenRegisterModalOptions {
    includePdfMaterial?: boolean;
}

interface AIMasterclassRegisterModalContextType {
    isOpen: boolean;
    initialIncludePdfMaterial: boolean;
    openRegisterModal: (options?: OpenRegisterModalOptions) => void;
    closeRegisterModal: () => void;
}

const AIMasterclassRegisterModalContext = createContext<AIMasterclassRegisterModalContextType>({
    isOpen: false,
    initialIncludePdfMaterial: false,
    openRegisterModal: () => { },
    closeRegisterModal: () => { },
});

export const useAIMasterclassRegisterModal = () => useContext(AIMasterclassRegisterModalContext);

export const AIMasterclassRegisterModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [initialIncludePdfMaterial, setInitialIncludePdfMaterial] = useState(false);

    const openRegisterModal = useCallback((options?: OpenRegisterModalOptions) => {
        setInitialIncludePdfMaterial(Boolean(options?.includePdfMaterial));
        setIsOpen(true);
    }, []);

    const closeRegisterModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <AIMasterclassRegisterModalContext.Provider value={{ isOpen, initialIncludePdfMaterial, openRegisterModal, closeRegisterModal }}>
            {children}
        </AIMasterclassRegisterModalContext.Provider>
    );
};
