import React, { createContext, useContext, useState, useCallback } from "react";

interface RegisterModalContextType {
    isOpen: boolean;
    isVideoDocked: boolean;
    openRegisterModal: () => void;
    closeRegisterModal: () => void;
    setIsVideoDocked: (docked: boolean) => void;
}

const RegisterModalContext = createContext<RegisterModalContextType>({
    isOpen: false,
    isVideoDocked: false,
    openRegisterModal: () => { },
    closeRegisterModal: () => { },
    setIsVideoDocked: () => { },
});

export const useRegisterModal = () => useContext(RegisterModalContext);

export const RegisterModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVideoDocked, setIsVideoDocked] = useState(false);

    const openRegisterModal = useCallback(() => setIsOpen(true), []);
    const closeRegisterModal = useCallback(() => setIsOpen(false), []);

    return (
        <RegisterModalContext.Provider value={{
            isOpen,
            isVideoDocked,
            openRegisterModal,
            closeRegisterModal,
            setIsVideoDocked
        }}>
            {children}
        </RegisterModalContext.Provider>
    );
};
