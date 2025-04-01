import { useContext, createContext, useState, useEffect } from "react";
import { SafeAreaView } from "react-native";
import TextCustom from "../app/components/textCustom";
import { AuthApiService } from '../services/authApi';
import { AuthTokenService } from '../services/authToken';
import { HttpRequestClient } from '../clients/httpRequest';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthService } from '../services/auth';
import axios from 'axios';

const AuthContext = createContext();
const authSvc = null;

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const authApiSvc = new AuthApiService(new HttpRequestClient(axios), process.env.AUTH_API_BASE_URL);
        const authtokenSvc = new AuthTokenService(AsyncStorage);
        authSvc = new AuthService(authApiSvc, authtokenSvc);
        checkAuth();
    };

    const checkAuth = async () => {
        try {
            // is token valid?
            if(isTokenValid()) setUser(null);

            // get user
            if(!user) {
                // get user data using user service, set user
            }

        } catch (error) {
           // set token to null, set user to null (this should automatially redirect user to sign in page)
        }
        setLoading(false);
    };

    const signin = async ({ email, password }) => {
        setLoading(true);
        try {
            // sign in user, set token
            authSvc.sinIn({ email, password });
            
            // get user, set user suing user svc
        } catch (error) {
            // set token to null, set user to null (this should automatially redirect user to sign in page)
        }
        setLoading(false);
    }
    const signout = async () => {
        setLoading(true);

        authSvc.singOut();
        setUser(null);
        
        setLoading(false);
    };

    const isTokenValid = () => {
        return authSvc.isTokenValid();
    };

    const contextData = { user, signin, signout, isTokenValid };
    return (
        <AuthContext.Provider value={contextData}>
            {loading ? (
                <SafeAreaView>
                    <TextCustom fontSize={48}>Loading..</TextCustom>
                </SafeAreaView>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    return useContext(AuthContext);
};

export { useAuth, AuthContext, AuthProvider };