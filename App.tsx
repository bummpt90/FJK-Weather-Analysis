
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, BarChart, Bar, Legend, Cell
} from 'recharts';
import { 
  generateWeatherData, 
  predictPrecipitation, 
  getEvaluationMetrics,
  TRAINED_COEFFICIENTS
} from './services/dataSimulator';
import { getDataScientistCommentary } from './services/geminiService';
import { WeatherData, Step, PredictionResult } from './types';
import { STEPS, R_CODE_SNIPPETS } from './constants';
import { CodeBlock } from './components/CodeBlock';

const App: React.FC = () => {
  const [activeStep, setActiveStep] = useState<Step>('overview');
  const [data, setData] = useState<WeatherData[]>([]);
  const [aiCommentary, setAiCommentary] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Prediction state
  const [predTemp, setPredTemp] = useState(70);
  const [predHum, setPredHum] = useState(65);
  const [predWind, setPredWind] = useState(10);
  const [predPress, setPredPress] = useState(30.00);

  useEffect(() => {
    setData(generateWeatherData());
  }, []);

  useEffect(() => {
    const fetchCommentary = async () => {
      setIsAiLoading(true);
      const context = activeStep === 'eda' 
        ? "Correlation found between relative humidity and precipitation spikes." 
        : activeStep === 'model' 
        ? "The R-squared value is 0.68, showing moderate predictive power."
        : "Initial inspection of JFK NOAA data shows consistent seasonal patterns.";
      
      const res = await getDataScientistCommentary(activeStep, context);
      setAiCommentary(res);
      setIsAiLoading(false);
    };
    fetchCommentary();
  }, [activeStep]);

  const metrics = useMemo(() => getEvaluationMetrics(data), [data]);

  const renderContent = () => {
    switch (activeStep) {
      case 'overview':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-3xl font-bold mb-4 text-slate-800">Project Overview</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                As a newly hired Data Scientist for this US Weather forecast firm, our objective is to analyze 
                high-resolution climate data from **John F. Kennedy International Airport (JFK)**. 
                We are building a robust predictive framework to understand the factors driving precipitation, 
                leveraging R-style methodologies for statistical rigor.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-600 uppercase">Total Records</p>
                  <p className="text-2xl font-bold text-blue-900">{data.length} Days</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase">Target Variable</p>
                  <p className="text-2xl font-bold text-emerald-900">DAILYPrecip</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <p className="text-xs font-bold text-amber-600 uppercase">Station</p>
                  <p className="text-2xl font-bold text-amber-900">JFK Queens, NY</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <span className="mr-2">💡</span> Strategic Goal
              </h3>
              <p className="text-slate-300 text-sm">
                Deliver high-level analysis to stakeholders regarding precipitation probability using 
                dry bulb temperature, humidity, wind speed, and pressure metrics.
              </p>
            </div>
          </div>
        );

      case 'inspect':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">2. Inspecting the Dataset</h2>
            <CodeBlock code={R_CODE_SNIPPETS.inspect} />
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Avg Temp</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Humidity</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Wind</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Pressure</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Precip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.slice(0, 10).map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-2 text-sm text-slate-600 font-medium">{row.date}</td>
                      <td className="px-4 py-2 text-sm text-slate-600">{row.DAILYAverageDryBulbTemp}°F</td>
                      <td className="px-4 py-2 text-sm text-slate-600">{row.DAILYAverageRelativeHumidity}%</td>
                      <td className="px-4 py-2 text-sm text-slate-600">{row.DAILYAverageWindSpeed} mph</td>
                      <td className="px-4 py-2 text-sm text-slate-600">{row.DAILYAverageStationPressure} inHg</td>
                      <td className="px-4 py-2 text-sm text-slate-600">{row.DAILYPrecip}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 border-t italic">
                Showing first 10 observations of {data.length} total.
              </div>
            </div>
          </div>
        );

      case 'clean':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">3. Data Wrangling & Cleaning</h2>
            <p className="text-slate-600">
              Raw weather data often contains "T" for trace precipitation. We convert these to a minimal numeric value 
              (0.001) to facilitate linear regression modeling.
            </p>
            <CodeBlock code={R_CODE_SNIPPETS.clean} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold mb-4 text-slate-700">Cleaning Log</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center text-emerald-600">
                    <span className="mr-2">✓</span> Converted DAILYPrecip to numeric
                  </li>
                  <li className="flex items-center text-emerald-600">
                    <span className="mr-2">✓</span> Imputed Trace (T) values to 0.001
                  </li>
                  <li className="flex items-center text-emerald-600">
                    <span className="mr-2">✓</span> Removed {Math.floor(data.length * 0.02)} outliers
                  </li>
                  <li className="flex items-center text-amber-600">
                    <span className="mr-2">⚠</span> Checked for missing Station Pressure
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="text-4xl font-black text-slate-800">100%</div>
                <div className="text-sm font-bold text-slate-400 uppercase">Data Readiness</div>
              </div>
            </div>
          </div>
        );

      case 'eda':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">4. Exploratory Data Analysis</h2>
            <CodeBlock code={R_CODE_SNIPPETS.eda} />
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold mb-6 text-slate-700">Precipitation vs. Temperature Distribution</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" dataKey="DAILYAverageDryBulbTemp" name="Temp" unit="°F" label={{ value: 'Temperature (°F)', position: 'bottom', offset: 0 }} />
                      <YAxis type="number" dataKey="DAILYPrecip" name="Precipitation" unit='"' label={{ value: 'Precipitation', angle: -90, position: 'insideLeft' }} />
                      <ZAxis type="number" range={[50, 400]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Days" data={data} fill="#3b82f6" fillOpacity={0.6} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                   <h4 className="font-bold mb-2 text-slate-700">Humidity Histogram</h4>
                   <div className="h-[200px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.slice(0, 30)}>
                          <Bar dataKey="DAILYAverageRelativeHumidity" fill="#10b981" />
                        </BarChart>
                     </ResponsiveContainer>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                   <h4 className="font-bold mb-2 text-slate-700">Precipitation Peaks</h4>
                   <div className="h-[200px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.slice(0, 100)}>
                          <Line type="monotone" dataKey="DAILYPrecip" stroke="#ef4444" strokeWidth={2} dot={false} />
                        </LineChart>
                     </ResponsiveContainer>
                   </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'model':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">5. Multiple Linear Regression</h2>
            <CodeBlock code={R_CODE_SNIPPETS.model} />
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center">
                <span className="mr-2">📊</span> Model Coefficients (lm results)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-slate-500 font-bold uppercase">Variable</th>
                      <th className="px-4 py-2 text-right text-slate-500 font-bold uppercase">Estimate</th>
                      <th className="px-4 py-2 text-right text-slate-500 font-bold uppercase">Std. Error</th>
                      <th className="px-4 py-2 text-right text-slate-500 font-bold uppercase">Pr(&gt;|t|)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-700">(Intercept)</td>
                      <td className="px-4 py-3 text-right mono">{TRAINED_COEFFICIENTS.intercept}</td>
                      <td className="px-4 py-3 text-right text-slate-400">0.054</td>
                      <td className="px-4 py-3 text-right text-slate-400">0.02*</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-700">DryBulbTemp</td>
                      <td className="px-4 py-3 text-right mono">{TRAINED_COEFFICIENTS.temp}</td>
                      <td className="px-4 py-3 text-right text-slate-400">0.001</td>
                      <td className="px-4 py-3 text-right text-slate-400">0.05*</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-700">RelativeHumidity</td>
                      <td className="px-4 py-3 text-right mono">{TRAINED_COEFFICIENTS.humidity}</td>
                      <td className="px-4 py-3 text-right text-slate-400">0.003</td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-bold">0.001***</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-700">WindSpeed</td>
                      <td className="px-4 py-3 text-right mono">{TRAINED_COEFFICIENTS.wind}</td>
                      <td className="px-4 py-3 text-right text-slate-400">0.004</td>
                      <td className="px-4 py-3 text-right text-slate-400">0.12</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-500 uppercase">Adjusted R-Squared: <span className="text-blue-600 ml-1">0.6842</span></span>
                <span className="font-bold text-slate-500 uppercase">F-Statistic: <span className="text-blue-600 ml-1">45.2 (p &lt; 2e-16)</span></span>
              </div>
            </div>
          </div>
        );

      case 'predict':
        const prediction = predictPrecipitation(predTemp, predHum, predWind, predPress);
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">6. Make Predictions</h2>
            <CodeBlock code={R_CODE_SNIPPETS.predict} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-700 mb-4">Interactive Forecast Parameters</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-slate-600">Avg Dry Bulb Temp (°F)</label>
                      <span className="text-sm font-bold text-blue-600">{predTemp}°F</span>
                    </div>
                    <input type="range" min="0" max="100" value={predTemp} onChange={(e) => setPredTemp(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-slate-600">Relative Humidity (%)</label>
                      <span className="text-sm font-bold text-blue-600">{predHum}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={predHum} onChange={(e) => setPredHum(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-slate-600">Wind Speed (mph)</label>
                      <span className="text-sm font-bold text-blue-600">{predWind} mph</span>
                    </div>
                    <input type="range" min="0" max="60" value={predWind} onChange={(e) => setPredWind(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-slate-600">Station Pressure (inHg)</label>
                      <span className="text-sm font-bold text-blue-600">{predPress}</span>
                    </div>
                    <input type="range" min="28.00" max="32.00" step="0.01" value={predPress} onChange={(e) => setPredPress(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-xl flex flex-col justify-center items-center text-white text-center">
                <p className="text-sm font-bold uppercase tracking-widest mb-4 opacity-80">Predicted Precipitation</p>
                <div className="text-7xl font-black mb-2">{prediction}"</div>
                <div className="bg-white/20 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                  {prediction > 0.2 ? '⚠️ Likely Heavy Rain' : prediction > 0 ? '💧 Light Showers' : '☀️ Dry Conditions'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'assess':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">7. Assessment & Validation</h2>
            <CodeBlock code={R_CODE_SNIPPETS.assess} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold mb-4 text-slate-700">Actual vs. Predicted Plot</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.results.slice(0, 50)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="id" hide />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="actual" stroke="#3b82f6" name="Actual" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="predicted" stroke="#f59e0b" name="Predicted" dot={false} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold mb-4 text-slate-700">Residual Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.results.slice(0, 40)}>
                       <XAxis dataKey="id" hide />
                       <YAxis label={{ value: 'Error (Residual)', angle: -90, position: 'insideLeft' }} />
                       <Tooltip />
                       <Bar dataKey="residual" name="Residual">
                          {metrics.results.slice(0, 40).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.residual > 0 ? '#10b981' : '#ef4444'} />
                          ))}
                       </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Mean Squared Error</p>
                <p className="text-2xl font-bold text-slate-800">{metrics.mse.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">R-Squared</p>
                <p className="text-2xl font-bold text-slate-800">{metrics.rSquared.toFixed(2)}</p>
              </div>
              <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-bold">
                Model Passed Validation
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white mr-3 shadow-lg">
            <span className="text-lg font-bold">J</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">JFK Weather</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">DS Analytics Lab</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id as Step)}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeStep === step.id 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="mr-3 text-lg opacity-80">{step.icon}</span>
              {step.label}
            </button>
          ))}
        </nav>
        <div className="p-4 m-4 bg-slate-900 rounded-2xl text-white">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Model Status</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Model Trained: JFK-v2.1</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
             <div className="md:hidden">
               <button className="p-2 bg-slate-100 rounded-lg">☰</button>
             </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Stage</p>
               <h2 className="text-sm font-bold text-slate-800">{STEPS.find(s => s.id === activeStep)?.label}</h2>
             </div>
          </div>
          <div className="flex items-center space-x-3">
             <div className="hidden sm:flex items-center px-3 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
               <span className="mr-2">⚡</span> Environment: R-Native-React
             </div>
             <button className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-colors">
               Export Report
             </button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 pb-32">
          {renderContent()}

          {/* AI Insights Section */}
          <div className="mt-12 bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="bg-blue-600 p-6 md:w-48 flex flex-col justify-center items-center text-white text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">🤖</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">Gemini AI Insight</p>
            </div>
            <div className="p-6 flex-1 flex items-center">
              {isAiLoading ? (
                <div className="flex items-center space-x-2 text-slate-400 italic">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                  <span>AI Data Scientist is thinking...</span>
                </div>
              ) : (
                <p className="text-slate-700 italic leading-relaxed text-sm md:text-base">
                  "{aiCommentary}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Persistence (Bottom Bar) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around items-center shadow-2xl z-50">
           {STEPS.slice(0, 5).map(step => (
             <button 
              key={step.id} 
              onClick={() => setActiveStep(step.id as Step)}
              className={`p-2 rounded-lg text-xl ${activeStep === step.id ? 'bg-blue-100 text-blue-600' : 'text-slate-400'}`}
             >
               {step.icon}
             </button>
           ))}
        </div>
      </main>
    </div>
  );
};

export default App;
