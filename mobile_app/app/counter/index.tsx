import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { decrement, increment, reset } from "../../src/features/counter/counterSlice";
import { useAppDispatch, useAppSelector } from "../../src/hooks/reduxHooks";

export default function CounterScreen() {
  const value = useAppSelector((state: { counter: { value: any; }; }) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Counter: {value}</Text>

      <View style={styles.buttonRow}>
        <Button title="+" onPress={() => dispatch(increment())} />
        <Button title="-" onPress={() => dispatch(decrement())} />
        <Button title="Reset" onPress={() => dispatch(reset())} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
});
