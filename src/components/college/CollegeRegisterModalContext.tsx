import React, { createContext, useContext, useState } from "react";

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

export const useCollegeRegisterModal = () => useContext(RegisterModalContext);

export const CollegeRegisterModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVideoDocked, setIsVideoDocked] = useState(false);

    return (
        <RegisterModalContext.Provider value={{
            isOpen,
            isVideoDocked,
            openRegisterModal: () => setIsOpen(true),
            closeRegisterModal: () => setIsOpen(false),
            setIsVideoDocked
        }}>
            {children}
        </RegisterModalContext.Provider>
    );
};
