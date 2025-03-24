import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Tabs } from "expo-router";

const _Layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{ title: "Home", headerShown: false }}
      />{" "}
      <Tabs.Screen
        name="tab1"
        options={{ title: "tab1", headerShown: false }}
      />{" "}
      <Tabs.Screen
        name="tab2"
        options={{ title: "tab2", headerShown: false }}
      />{" "}
      <Tabs.Screen
        name="tab3"
        options={{ title: "tab3", headerShown: false }}
      />
    </Tabs>
  );
};
export default _Layout;

const styles = StyleSheet.create({});
