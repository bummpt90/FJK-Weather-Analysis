
export interface WeatherData {
  id: number;
  date: string;
  DAILYAverageDryBulbTemp: number;
  DAILYAverageRelativeHumidity: number;
  DAILYAverageWindSpeed: number;
  DAILYAverageStationPressure: number;
  DAILYPrecip: number;
  isTrace: boolean;
}

export type Step = 
  | 'overview'
  | 'inspect'
  | 'clean'
  | 'eda'
  | 'model'
  | 'predict'
  | 'assess';

export interface ModelCoefficients {
  intercept: number;
  temp: number;
  humidity: number;
  wind: number;
  pressure: number;
}

export interface PredictionResult {
  actual: number;
  predicted: number;
  residual: number;
}
