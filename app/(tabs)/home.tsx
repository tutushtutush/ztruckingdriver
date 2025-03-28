import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { getData } from "../../services/apiService";

const HomePage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getData("/home");
        setData(result);
      } catch (err: any) {
        setError(err.response?.data?.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text style={{ color: "red" }}>{error}</Text>;

  return (
    <View>
      <Text>Home Page Data:</Text>
      <Text>{JSON.stringify(data, null, 2)}</Text>
    </View>
  );
};

export default HomePage;
