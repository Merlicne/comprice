

export type Unit = 'pcs' | 'kg' | 'g' | 'L' | 'ml';

export interface Item {
  name: string;
  price: number;
  volume: number;
  unit: Unit;
}
