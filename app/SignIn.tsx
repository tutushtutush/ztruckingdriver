import {SafeAreaView, Text } from 'react-native';
import React from 'react';
import { useAuth } from '@/context/authContext';
import { Redirect } from 'expo-router';

const SignIn = () => {
    const { isTokenValid } = useAuth();

    if(isTokenValid) <Redirect href={'/(tabs)'}/>;

    return (
        <SafeAreaView>
            <Text>SignIn</Text>
        </SafeAreaView>
    )
}

export default SignIn;