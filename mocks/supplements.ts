import { Supplement } from '@/types/nutrition';

export const supplements: Supplement[] = [
  {
    id: '1',
    name: 'Protein Powder',
    dosage: '1 scoop',
    timeOfDay: 'Post-workout',
    taken: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: '2',
    name: 'Creatine',
    dosage: '5g',
    timeOfDay: 'Morning',
    taken: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: '3',
    name: 'Vitamin D',
    dosage: '2000 IU',
    timeOfDay: 'Morning',
    taken: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: '4',
    name: 'Fish Oil',
    dosage: '1000mg',
    timeOfDay: 'With meal',
    taken: false,
    date: new Date().toISOString().split('T')[0],
  },
];