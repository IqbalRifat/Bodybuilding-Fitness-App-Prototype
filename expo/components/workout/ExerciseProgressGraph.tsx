import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, useColorScheme } from 'react-native';
import { Card } from '@/components/ui/Card';
import Colors from '@/constants/colors';
import { useWorkoutStore } from '@/store/workout-store';
import { LineChart } from 'react-native-chart-kit';

interface ExerciseProgressGraphProps {
  exerciseId: string;
  exerciseName: string;
}

type WeightData = { date: string; maxWeight: number }[];
type VolumeData = { date: string; totalVolume: number }[];

export const ExerciseProgressGraph: React.FC<ExerciseProgressGraphProps> = ({
  exerciseId,
  exerciseName,
}) => {
  const [metric, setMetric] = useState<'weight' | 'volume'>('weight');
  const colorScheme = useColorScheme() || 'dark';
  const colors = Colors[colorScheme];
  
  const getExerciseMaxWeight = useWorkoutStore(state => state.getExerciseMaxWeight);
  const getExerciseTotalVolume = useWorkoutStore(state => state.getExerciseTotalVolume);
  
  // Explicitly type the data to avoid TypeScript errors
  const weightData = getExerciseMaxWeight(exerciseId) as WeightData;
  const volumeData = getExerciseTotalVolume(exerciseId) as VolumeData;
  
  if (weightData.length === 0 && volumeData.length === 0) {
    return (
      <Card style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>{exerciseName} Progress</Text>
        <Text style={[styles.noDataText, { color: colors.subtext }]}>
          No progress data available yet. Complete workouts with this exercise to see your progress.
        </Text>
      </Card>
    );
  }
  
  // Use the appropriate data based on the selected metric
  const currentData = metric === 'weight' ? weightData : volumeData;
  
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
        color: () => colors.primary,
        strokeWidth: 2,
      },
    ],
    legend: [`Max ${metric === 'weight' ? 'Weight' : 'Volume'}`],
  };
  
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{exerciseName} Progress</Text>
        <View style={[styles.metricToggle, { backgroundColor: colors.neutral }]}>
          <TouchableOpacity
            style={[
              styles.metricButton,
              metric === 'weight' ? { backgroundColor: colors.primary } : null
            ]}
            onPress={() => setMetric('weight')}
          >
            <Text style={[
              styles.metricButtonText, 
              { color: metric === 'weight' && colorScheme === 'dark' ? '#111111' : colors.text }
            ]}>
              Weight
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.metricButton,
              metric === 'volume' ? { backgroundColor: colors.primary } : null
            ]}
            onPress={() => setMetric('volume')}
          >
            <Text style={[
              styles.metricButtonText, 
              { color: metric === 'volume' && colorScheme === 'dark' ? '#111111' : colors.text }
            ]}>
              Volume
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 64}
          height={220}
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(${colorScheme === 'dark' ? '0, 207, 255' : '0, 123, 255'}, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(${colorScheme === 'dark' ? '255, 255, 255' : '51, 51, 51'}, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: colors.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {values.length > 0 ? Math.max(...values) : 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>
            Max {metric === 'weight' ? 'Weight' : 'Volume'}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>
            Average
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {values.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>
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
  },
  metricToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  metricButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  metricButtonText: {
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
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
});