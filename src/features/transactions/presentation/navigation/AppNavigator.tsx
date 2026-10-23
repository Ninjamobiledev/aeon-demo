import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TransactionDetailsScreen } from '../screens/TransactionDetailsScreen';
import { TransactionHistoryScreen } from '../screens/TransactionHistoryScreen';
import type { TransactionStackParamList } from './types';
import { colors } from '../../../../constants/colors';

const Stack = createNativeStackNavigator<TransactionStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="TransactionHistory"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="TransactionHistory"
          component={TransactionHistoryScreen}
        />
        <Stack.Screen
          name="TransactionDetails"
          component={TransactionDetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
