import React, { useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import App from './index';
import SettingsScreen from '../components/Settings/SettingsScreen';

export default function RootLayout() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'settings'>('home');
  const [tasks, setTasks] = useState([]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
        <Image source={require('../assets/images/todo-logo.png')} style={{ width: 70, height: 40 }} />
        {currentScreen === 'home' && (
          <TouchableOpacity onPress={() => setCurrentScreen('settings')}>
            <Image
              source={require('../assets/images/gear.png')}
              style={{ width: 24, height: 24, marginRight: 15 }}
            />
          </TouchableOpacity>
        )}
      </View>

      {currentScreen === 'home' ? (
        <App />
      ) : (
        <SettingsScreen onBack={() => setCurrentScreen('home')} taskCount={tasks.length} />
      )}
    </View>
  );
}