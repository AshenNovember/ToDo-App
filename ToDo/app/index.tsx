import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useNotifications from '../components/Notifications/useNotifications';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './styles';
import { getSettings } from '../components/Settings/SettingsScreen';

interface Task {
  id: number;
  text: string;
  priority: number;
}

const App = () => {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState(1);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'edit'>('home');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const { scheduleNotification, notificationFrequency } = useNotifications(tasks.length);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      scheduleNotification(settings.notificationFrequency);
      console.log(settings);
    };
  
    loadSettings();
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        const parsedTasks: Task[] = JSON.parse(savedTasks);
        const validTasks = parsedTasks.map(task => ({
          ...task,
          id: task.id || Date.now() + Math.random(),
        }));
        setTasks(validTasks);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as tarefas.');
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as tarefas.');
    }
  };

  const handleAddTask = () => {
    if (task.trim() === '') {
      Alert.alert('Erro', 'Digite uma tarefa válida.');
      return;
    }
    const newTask: Task = { id: Date.now(), text: task, priority };
    setTasks([...tasks, newTask]);
    setTask('');
    setPriority(1);
    setCurrentScreen('home');
  };

  const handleEditTask = () => {
    if (editingTask) {
      setTasks(tasks.map(t => (t.id === editingTask.id ? { ...editingTask, priority } : t)));
      setEditingTask(null);
      setPriority(1);
      setCurrentScreen('home');
    }
  };

  const handleDeleteTask = (taskId: number) => {
    Alert.alert(
      'Excluir Tarefa',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: () => {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            setTasks(updatedTasks);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleExpandTask = (taskId: number) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return '#D2665A';
      case 2: return '#F2B28C';
      case 3: return '#F6DED8';
      default: return '#ffffff';
    }
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'home' ? (
        <>
          <Text style={styles.title}>Sua lista de tarefas atual</Text>
          {tasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Image source={require('../assets/images/todo-boy.png')} style={styles.image} />
              <Text style={styles.emptyText}>Você não tem tarefas por enquanto!</Text>
            </View>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => toggleExpandTask(item.id)}>
                  <View style={[styles.taskItem, { backgroundColor: getPriorityColor(item.priority) }]}>
                    <Text
                      style={styles.taskText}
                      numberOfLines={expandedTaskId === item.id ? undefined : 2}
                      ellipsizeMode="tail"
                    >
                      {item.text}
                    </Text>
                    {expandedTaskId === item.id && (
                      <View style={styles.buttonsContainer}>
                        <TouchableOpacity onPress={() => { setEditingTask(item); setPriority(item.priority); setCurrentScreen('edit'); }}>
                          <MaterialIcons name="edit" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
                          <MaterialIcons name="delete" size={24} color="white" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity onPress={() => setCurrentScreen('edit')} style={styles.addButton}>
            <MaterialIcons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>Adicionar Nova Tarefa</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.editContainer}>
          <Text style={styles.editTitle}>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Digite uma tarefa"
              value={editingTask ? editingTask.text : task}
              onChangeText={text => editingTask ? setEditingTask({ ...editingTask, text }) : setTask(text)}
              multiline
              scrollEnabled
            />
          </View>
          <View style={styles.card}>
            <Text style={styles.priorityLabel}>Prioridade:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={priority}
                onValueChange={(itemValue) => setPriority(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Alta" value={1} />
                <Picker.Item label="Média" value={2} />
                <Picker.Item label="Baixa" value={3} />
              </Picker>
            </View>
          </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={editingTask ? handleEditTask : handleAddTask} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>{editingTask ? "Salvar Alterações" : "Adicionar"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
export default App;