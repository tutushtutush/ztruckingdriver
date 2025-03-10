import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'

const Login = () => {
    // add state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Add your login logic here
    console.log('Login button pressed', username, password);
  }

  return (
    <View>
      <Text>Username</Text>
      <TextInput placeholder="Username" onChangeText={setUsername}/>
      <Text>Password</Text>
      <TextInput placeholder="Password" onChangeText={setPassword} secureTextEntry/>
      <Button title="Login" onPress={handleLogin} />
    </View>
  )
}

export default Login

const styles = StyleSheet.create({})