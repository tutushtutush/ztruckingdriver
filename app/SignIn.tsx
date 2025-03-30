import {SafeAreaView, Text } from 'react-native';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';

const SignIn = () => {
    const { session } = useAuth();

    if(session) <Redirect href={'/(tabs)'}/>;

    return (
        <SafeAreaView>
            <Text>SignIn</Text>
        </SafeAreaView>
    )
}

export default SignIn