
import React from 'react';

export const STEPS = [
  { id: 'overview', label: '1. Overview', icon: '🏠' },
  { id: 'inspect', label: '2. Inspect Data', icon: '🔍' },
  { id: 'clean', label: '3. Data Wrangling', icon: '🧹' },
  { id: 'eda', label: '4. EDA & Stats', icon: '📊' },
  { id: 'model', label: '5. Linear Regression', icon: '⚙️' },
  { id: 'predict', label: '6. Predictions', icon: '🔮' },
  { id: 'assess', label: '7. Model Assessment', icon: '✅' },
] as const;

export const R_CODE_SNIPPETS = {
  inspect: `head(jfk_weather)
str(jfk_weather)
summary(jfk_weather)`,
  clean: `jfk_weather <- jfk_weather %>%
  mutate(DAILYPrecip = as.numeric(ifelse(DAILYPrecip == "T", 0.001, DAILYPrecip))) %>%
  filter(!is.na(DAILYPrecip))`,
  eda: `library(ggplot2)
ggplot(jfk_weather, aes(x=DAILYAverageDryBulbTemp, y=DAILYPrecip)) + 
  geom_point() + geom_smooth(method="lm")`,
  model: `model <- lm(DAILYPrecip ~ DAILYAverageDryBulbTemp + 
           DAILYAverageRelativeHumidity + DAILYAverageWindSpeed, 
           data = jfk_weather)
summary(model)`,
  predict: `new_data <- data.frame(DAILYAverageDryBulbTemp = 75, 
                        DAILYAverageRelativeHumidity = 60, 
                        DAILYAverageWindSpeed = 10)
predict(model, new_data)`,
  assess: `plot(model)
hist(residuals(model))`
};
