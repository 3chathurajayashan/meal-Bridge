 
import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";



type ProfileImage = {
    publicId: string;
    url: string;
};

export type User = {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    role: string;
    isActive: boolean;
    location?: {
        latitude: number;
        longitude: number;
    };
    profileImage?: ProfileImage;
};

type AuthContextType = {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    login: (user: User, accessToken: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const login = (user: User, accessToken: string) => {
        setUser(user);
        setAccessToken(accessToken);

        console.log("AuthContext - User stored:", user);
        console.log("AuthContext - Token stored");
    };

    const logout = () => {
        setUser(null);
        setAccessToken(null);

        console.log("User logged out");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isAuthenticated: !!user && !!accessToken,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}; 
