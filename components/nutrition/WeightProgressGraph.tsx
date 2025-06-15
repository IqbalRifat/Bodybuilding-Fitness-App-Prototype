import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card } from '@/components/ui/Card';
import Colors from '@/constants/colors';
import { useNutritionStore } from '@/store/nutrition-store';
import { useUserStore } from '@/store/user-store';
import { LineChart } from 'react-native-chart-kit';

export const WeightProgressGraph: React.FC = () => {
  const getNormalizedWeightData = useNutritionStore(state => state.getNormalizedWeightData);
  const profile = useUserStore(state => state.profile);
  
  const weightData = getNormalizedWeightData();
  
  if (weightData.length < 2) {
    return (
      <Card style={styles.container}>
        <Text style={styles.title}>Weight Progress</Text>
        <Text style={styles.noDataText}>
          Not enough weight entries to show a graph. Add at least two weight entries to see your progress.
        </Text>
      </Card>
    );
  }
  
  // Format dates for display
  const labels = weightData.map(item => {
    const date = new Date(item.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  
  // Use every other label to avoid crowding
  const displayLabels = labels.map((label, index) => index % 2 === 0 ? label : '');
  
  const values = weightData.map(item => item.weight);
  
  const chartData = {
    labels: displayLabels,
    datasets: [
      {
        data: values,
        color: () => Colors.dark.primary,
        strokeWidth: 2,
      },
    ],
    legend: [`Weight (${profile?.weightUnit || 'kg'})`],
  };
  
  // Calculate stats
  const startWeight = values[0];
  const currentWeight = values[values.length - 1];
  const change = currentWeight - startWeight;
  const percentChange = ((change / startWeight) * 100).toFixed(1);
  
  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Weight Progress</Text>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 64}
          height={220}
          chartConfig={{
            backgroundColor: Colors.dark.card,
            backgroundGradientFrom: Colors.dark.card,
            backgroundGradientTo: Colors.dark.card,
            decimalPlaces: 1,
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
            {startWeight} {profile?.weightUnit || 'kg'}
          </Text>
          <Text style={styles.statLabel}>
            Starting Weight
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {currentWeight} {profile?.weightUnit || 'kg'}
          </Text>
          <Text style={styles.statLabel}>
            Current Weight
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[
            styles.statValue,
            change > 0 ? styles.positiveChange : change < 0 ? styles.negativeChange : null
          ]}>
            {change > 0 ? '+' : ''}{change} ({percentChange}%)
          </Text>
          <Text style={styles.statLabel}>
            Change
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  positiveChange: {
    color: Colors.dark.primary,
  },
  negativeChange: {
    color: Colors.dark.error,
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