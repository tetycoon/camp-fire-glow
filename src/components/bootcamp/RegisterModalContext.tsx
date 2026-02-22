import React, { createContext, useContext, useState, useCallback } from "react";

interface RegisterModalContextType {
    isOpen: boolean;
    openRegisterModal: () => void;
    closeRegisterModal: () => void;
}

const RegisterModalContext = createContext<RegisterModalContextType>({
    isOpen: false,
    openRegisterModal: () => { },
    closeRegisterModal: () => { },
});

export const useRegisterModal = () => useContext(RegisterModalContext);

export const RegisterModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openRegisterModal = useCallback(() => setIsOpen(true), []);
    const closeRegisterModal = useCallback(() => setIsOpen(false), []);

    return (
        <RegisterModalContext.Provider value={{ isOpen, openRegisterModal, closeRegisterModal }}>
            {children}
        </RegisterModalContext.Provider>
    );
};
