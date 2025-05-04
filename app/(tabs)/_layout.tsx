import { View, Text, ImageBackground, Image } from 'react-native';
import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { images } from '@/constants/images';
import { icons } from '@/constants/icons';
import ProtectedRoutes from "../../context/protectedRoutes";
import { useLocation } from '../../context/location';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const TabIcon = ({ focused, icon, title, isLocationTracking }: any) => {
    if (title === 'Location') {
        if (focused) {
            return (
                <ImageBackground
                    source={images.highlight}
                    className='flex flex-row w-full flex-1 min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden'
                >
                    <View className="relative">
                        <Image 
                            source={icon} 
                            style={{ tintColor: isLocationTracking ? '#4CAF50' : '#151312' }} 
                            className='size-5' 
                        />
                        {isLocationTracking && (
                            <View className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                        )}
                    </View>
                    <Text className='text-secondary text-base font-semibold ml-2'>{title}</Text>
                </ImageBackground>
            );
        }
        return (
            <View className='size-full justify-center items-center mt-4 rounded-full'>
                <View className="relative">
                    <Image source={icon} style={{ tintColor: isLocationTracking ? '#4CAF50' : '#A8B5DB' }} className='size-5' />
                    {isLocationTracking && (
                        <View className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                    )}
                </View>
            </View>
        );
    }

    if(focused) {
        return (
            <ImageBackground
                source={images.highlight}
                className='flex flex-row w-full flex-1 min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden'
            >
                <Image source={icon} style={{ tintColor: '#151312' }} className='size-5' />
                <Text className='text-secondary text-base font-semibold ml-2'>{title}</Text>
            </ImageBackground>
        )
    }
    else {
        return (
            <View className='size-full justify-center items-center mt-4 rounded-full'>
                <Image source={icon} style={{ tintColor: '#A8B5DB' }} className='size-5' />
            </View>
        )
    }
}

const _layout = () => {
  const { isTracking } = useLocation();

  return (
    <ProtectedRoutes>
    <Tabs
        screenOptions={{
            tabBarShowLabel:false,
            tabBarItemStyle: {
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
            },
            tabBarStyle: {
                backgroundColor: '#0f0D23',
                borderRadius: 50,
                marginHorizontal: 20,
                marginBottom: 36,
                height: 52,
                position: 'absolute',
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#0f0D23',
            },
        }}
    >
        <Tabs.Screen 
            name='index'
            options={{
                title: 'Home',
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <TabIcon focused={focused} icon={icons.home} title='Home' />
                )
            }}
        />
        <Tabs.Screen 
            name='location'
            options={{
                title: 'Location',
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <TabIcon 
                        focused={focused} 
                        icon={icons.location} 
                        title='Location'
                        isLocationTracking={isTracking}
                    />
                )
            }}
        />
        <Tabs.Screen 
            name='profile'
            options={{
                title: 'Profile',
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <TabIcon focused={focused} icon={icons.person} title='Profile' />
                )
            }}
        />
    </Tabs>
    </ProtectedRoutes>
  )
}

export default _layout