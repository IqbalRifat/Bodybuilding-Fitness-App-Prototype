import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import Colors from '@/constants/colors';
import { useWorkoutStore } from '@/store/workout-store';
import { LineChart } from 'react-native-chart-kit';

interface ExerciseProgressGraphProps {
  exerciseId: string;
  exerciseName: string;
}

export const ExerciseProgressGraph: React.FC<ExerciseProgressGraphProps> = ({
  exerciseId,
  exerciseName,
}) => {
  const [metric, setMetric] = useState<'weight' | 'volume'>('weight');
  
  const getExerciseMaxWeight = useWorkoutStore(state => state.getExerciseMaxWeight);
  const getExerciseTotalVolume = useWorkoutStore(state => state.getExerciseTotalVolume);
  
  const weightData = getExerciseMaxWeight(exerciseId);
  const volumeData = getExerciseTotalVolume(exerciseId);
  
  if (weightData.length === 0 && volumeData.length === 0) {
    return (
      <Card style={styles.container}>
        <Text style={styles.title}>{exerciseName} Progress</Text>
        <Text style={styles.noDataText}>
          No progress data available yet. Complete workouts with this exercise to see your progress.
        </Text>
      </Card>
    );
  }
  
  // Use the appropriate data based on the selected metric
  const currentData = metric === 'weight' ? weightData : volumeData;
  
  // Format dates for display
  const labels = currentData.map(item => {
    const date = new Date(item.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  
  // Extract values based on the selected metric
  const values = metric === 'weight' 
    ? weightData.map(item => item.maxWeight)
    : volumeData.map(item => item.totalVolume);
  
  const chartData = {
    labels,
    datasets: [
      {
        data: values.length > 0 ? values : [0],
        color: () => Colors.dark.primary,
        strokeWidth: 2,
      },
    ],
    legend: [`Max ${metric === 'weight' ? 'Weight' : 'Volume'}`],
  };
  
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{exerciseName} Progress</Text>
        <View style={styles.metricToggle}>
          <TouchableOpacity
            style={[
              styles.metricButton,
              metric === 'weight' ? styles.metricButtonActive : null
            ]}
            onPress={() => setMetric('weight')}
          >
            <Text style={styles.metricButtonText}>Weight</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.metricButton,
              metric === 'volume' ? styles.metricButtonActive : null
            ]}
            onPress={() => setMetric('volume')}
          >
            <Text style={styles.metricButtonText}>Volume</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 64}
          height={220}
          chartConfig={{
            backgroundColor: Colors.dark.card,
            backgroundGradientFrom: Colors.dark.card,
            backgroundGradientTo: Colors.dark.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(170, 255, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: Colors.dark.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.max(...values)}
          </Text>
          <Text style={styles.statLabel}>
            Max {metric === 'weight' ? 'Weight' : 'Volume'}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0}
          </Text>
          <Text style={styles.statLabel}>
            Average
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {values.length}
          </Text>
          <Text style={styles.statLabel}>
            Workouts
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  metricToggle: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  metricButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  metricButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  metricButtonText: {
    color: Colors.dark.text,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginTop: 4,
  },
  noDataText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
});