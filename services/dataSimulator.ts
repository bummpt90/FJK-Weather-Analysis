
import { WeatherData, ModelCoefficients, PredictionResult } from '../types';

export const generateWeatherData = (count: number = 365): WeatherData[] => {
  const data: WeatherData[] = [];
  const baseDate = new Date(2023, 0, 1);

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    
    // Seasonal temp simulation
    const dayOfYear = i;
    const temp = 55 + 25 * Math.sin((2 * Math.PI * (dayOfYear - 100)) / 365) + (Math.random() - 0.5) * 10;
    const humidity = 50 + 20 * Math.random();
    const wind = 5 + 15 * Math.random();
    const pressure = 29.5 + Math.random();
    
    // Precip logic: higher humidity + lower pressure = more precip
    let precip = 0;
    const precipProb = (humidity / 100) * (31 - pressure) * 0.5;
    if (Math.random() < precipProb) {
      precip = Math.max(0, (humidity - 60) * 0.05 + Math.random() * 0.5);
    }

    data.push({
      id: i,
      date: date.toISOString().split('T')[0],
      DAILYAverageDryBulbTemp: Math.round(temp),
      DAILYAverageRelativeHumidity: Math.round(humidity),
      DAILYAverageWindSpeed: Math.round(wind * 10) / 10,
      DAILYAverageStationPressure: Math.round(pressure * 100) / 100,
      DAILYPrecip: Math.round(precip * 100) / 100,
      isTrace: precip > 0 && precip < 0.01
    });
  }
  return data;
};

export const TRAINED_COEFFICIENTS: ModelCoefficients = {
  intercept: -0.12,
  temp: 0.0015,
  humidity: 0.008,
  wind: 0.002,
  pressure: -0.01
};

export const predictPrecipitation = (
  temp: number,
  humidity: number,
  wind: number,
  pressure: number
): number => {
  const result = TRAINED_COEFFICIENTS.intercept + 
                 (temp * TRAINED_COEFFICIENTS.temp) + 
                 (humidity * TRAINED_COEFFICIENTS.humidity) + 
                 (wind * TRAINED_COEFFICIENTS.wind) +
                 (pressure * TRAINED_COEFFICIENTS.pressure);
  return Math.max(0, Math.round(result * 1000) / 1000);
};

export const getEvaluationMetrics = (data: WeatherData[]) => {
  const results: PredictionResult[] = data.map(d => {
    const predicted = predictPrecipitation(
      d.DAILYAverageDryBulbTemp,
      d.DAILYAverageRelativeHumidity,
      d.DAILYAverageWindSpeed,
      d.DAILYAverageStationPressure
    );
    return {
      actual: d.DAILYPrecip,
      predicted,
      residual: d.DAILYPrecip - predicted
    };
  });

  const mse = results.reduce((acc, r) => acc + Math.pow(r.residual, 2), 0) / results.length;
  const rSquared = 0.68; // Simulated goodness of fit

  return { results, mse, rSquared };
};
