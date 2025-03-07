import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

const useNotifications = (taskCount: number) => {
  const [notificationFrequency, setNotificationFrequency] = useState<string>();

  useEffect(() => {
    const configureNotifications = async () => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão negada. Você não receberá notificações.');
      }
    };

    configureNotifications();
  }, []);

  const scheduleNotification = async (frequency: string) => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (taskCount === 0) {
      console.log('Nenhuma tarefa pendente. Notificações canceladas.');
      return;
    }

    let trigger = null;
    if (frequency === 'minute') {
      trigger = {
        type: 'timeInterval',
        seconds: 60,
        repeats: true,
      };
    } else if (frequency === '5minutes') {
      trigger = {
        type: 'timeInterval',
        seconds: 300,
        repeats: true,
      };
    } else if (frequency === 'daily') {
      trigger = {
        type: 'calendar',
        hour: 9,
        minute: 0,
        repeats: true,
      };
    } else if (frequency === 'weekly') {
      trigger = {
        type: 'calendar',
        hour: 9,
        minute: 0,
        repeats: true,
        weekday: 1,
      };
    }

    if (trigger) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Lembrete de Tarefas',
          body: 'Não se esqueça de verificar suas tarefas! 📝',
        },
        trigger,
      });
    }
  };

  return {
    notificationFrequency,
    setNotificationFrequency,
    scheduleNotification, 
  };
};

export default useNotifications;
