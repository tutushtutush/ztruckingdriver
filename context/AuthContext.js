import { useContext, createContext, useState, useEffect } from "react";
import { Text, SafeAreaView } from "react-native";
import TextCustom from "../app/components/TextCustom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        checkAuth();
    };

    const checkAuth = async () => {
        try {
            // check if token is valid => token exist & is not expired
                // if token is valid, check if user data exists. If not get user and set user
            // if token not valid, set user to null (this should automatically redirect user to sign in page)

        } catch (error) {
           // set token to null, set user to null (this should automatially redirect user to sign in page)
        }
        setLoading(false);
    };

    const signin = async ({ email, password }) => {
        setLoading(true);
        try {
            // sign in user, set token
            
            // get user, set user
        } catch (error) {
            // set token to null, set user to null (this should automatially redirect user to sign in page)
        }
        setLoading(false);
    }
    const signout = async () => {
        setLoading(true);

        // delete token
        // delete user data
        // redirect user to sign in page
        
        setLoading(false);
    };

    const isTokenValid = () => {
        // check if token is valid
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

export { useAuth, AuthContext }; // export AuthProvider when needed