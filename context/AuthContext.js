import { useContext, createContext, useState } from 'react';
import { Text, SafeAreaView } from 'react-native'

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState(true);
    const [user, setUser] = useState(false);

    const signIn = async () => {}
    const signOut = async () => {}

    const contextData = { session, user, signIn, signOut };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? (
                <SafeAreaView><Text>Loading...</Text></SafeAreaView>
            ) : (
                children
            )}
        </AuthContext.Provider>
    )
}

const useAuth = () => {
    return useContext(AuthContext);
}

export {useAuth, AuthProvider} // export AuthContext when needed