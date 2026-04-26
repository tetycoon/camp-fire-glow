import React, { createContext, useContext, useState, useCallback } from "react";

interface UpscaleRegisterModalContextType {
    isOpen: boolean;
    openRegisterModal: () => void;
    closeRegisterModal: () => void;
}

const UpscaleRegisterModalContext = createContext<UpscaleRegisterModalContextType>({
    isOpen: false,
    openRegisterModal: () => { },
    closeRegisterModal: () => { },
});

export const useUpscaleRegisterModal = () => useContext(UpscaleRegisterModalContext);

export const UpscaleRegisterModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openRegisterModal = useCallback(() => setIsOpen(true), []);
    const closeRegisterModal = useCallback(() => setIsOpen(false), []);

    return (
        <UpscaleRegisterModalContext.Provider value={{ isOpen, openRegisterModal, closeRegisterModal }}>
            {children}
        </UpscaleRegisterModalContext.Provider>
    );
};
