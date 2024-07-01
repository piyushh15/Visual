import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../lib/appwrite";
import AsyncStorage from '@react-native-async-storage/async-storage';

const GlobalContext = createContext();

export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeUser = async () => {
            try {
                const currentSession = await AsyncStorage.getItem('currentSession');
                //console.log("curr");
                //console.log(currentSession);
                if (currentSession) {
                    const user = await getCurrentUser();
                    //console.log("user->");
                    //console.log(user);
                    if (user) {
                        setIsLoggedIn(true);
                        setUser(user);
                    } else {
                        setIsLoggedIn(false);
                        setUser(null);
                    }
                } else {
                    setIsLoggedIn(false);
                    setUser(null);
                }
            } catch (error) {
                console.log(error);
                setIsLoggedIn(false);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeUser();
    }, []);

    // if (isLoading) {
    //     // Optionally, render a loading indicator or return null
    //     return null;
    // }

    return (
        <GlobalContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                user,
                setUser,
                isLoading,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export default GlobalProvider;
