import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useNotifications from '../Notifications/useNotifications';
import * as Notifications from 'expo-notifications';
import { MaterialIcons } from '@expo/vector-icons';

interface SettingsScreenProps {
  onBack: () => void;
  taskCount: number;
}

export const getSettings = async () => {
  try {
    const savedSettings = await AsyncStorage.getItem('settings');
    return savedSettings ? JSON.parse(savedSettings) : { notificationFrequency: 'noNotifications' };
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    return { notificationFrequency: 'noNotifications' };
  }
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, taskCount }) => {
  const { scheduleNotification } = useNotifications(taskCount);
  const [notificationFrequency, setNotificationFrequency] = useState<string>('noNotifications');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (notificationFrequency !== null) {
      saveSettings();
    }
  }, [notificationFrequency, notificationsEnabled]);

  const saveSettings = async () => {
    try {
      const settings = JSON.stringify({ notificationFrequency });
      await AsyncStorage.setItem('settings', settings);
      console.log('Configurações salvas:', settings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('settings');
      if (settings) {
        const { notificationFrequency } = JSON.parse(settings);
        setNotificationFrequency(notificationFrequency);
        setNotificationsEnabled(notificationFrequency !== 'noNotifications');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleFrequencyChange = async (value: string) => {
    setNotificationFrequency(value);
    await AsyncStorage.setItem('settings', JSON.stringify({ notificationFrequency: value }));

    if (value === 'noNotifications') {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setNotificationsEnabled(false);
    } else {
      await scheduleNotification(value);
      setNotificationsEnabled(true);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);

    if (value) {
      const frequency = notificationFrequency !== 'noNotifications' ? notificationFrequency : 'minute';
      setNotificationFrequency(frequency);
      await scheduleNotification(frequency);
    } else {
      setNotificationFrequency('noNotifications');
      await Notifications.cancelAllScheduledNotificationsAsync();
    }

    await AsyncStorage.setItem('settings', JSON.stringify({ notificationFrequency: value ? notificationFrequency : 'noNotifications' }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#B82132" />
        </TouchableOpacity>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.card}>
        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <MaterialIcons name="notifications" size={24} color="#B82132" />
          </View>
          <Text style={styles.settingText}>Ativar Notificações</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: '#767577', true: '#B82132' }}
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {notificationsEnabled && (
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <MaterialIcons name="schedule" size={24} color="#B82132" />
            </View>
            <Text style={styles.settingText}>Frequência de Notificações</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={notificationFrequency}
                onValueChange={handleFrequencyChange}
                style={styles.picker}
              >
                <Picker.Item label="A cada minuto" value="minute" />
                <Picker.Item label="A cada 5 minutos" value="5minutes" />
                <Picker.Item label="Diária" value="daily" />
                <Picker.Item label="Semanal" value="weekly" />
              </Picker>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'left',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingIcon: {
    marginRight: 10,
  },
  settingText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    width: 150,
  },
  picker: {
    backgroundColor: '#fff',
  },
});

export default SettingsScreen;