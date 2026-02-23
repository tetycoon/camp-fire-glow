import React, { createContext, useContext, useState } from "react";

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

export const useCollegeRegisterModal = () => useContext(RegisterModalContext);

export const CollegeRegisterModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <RegisterModalContext.Provider value={{ isOpen, openRegisterModal: () => setIsOpen(true), closeRegisterModal: () => setIsOpen(false) }}>
            {children}
        </RegisterModalContext.Provider>
    );
};
