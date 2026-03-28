import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { BiometricScreen } from "../screens/BiometricScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { OtpScreen } from "../screens/OtpScreen";

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="Biometric" component={BiometricScreen} />
    </Stack.Navigator>
  );
}
