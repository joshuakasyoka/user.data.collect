'use client';

import React, { useState, useEffect } from 'react';

interface CategoryConfig {
  points: number;
}

interface Categories {
  [key: string]: CategoryConfig;
}

interface HoverTimes {
  [key: string]: number;
}

interface LastInteractionTime {
  [key: string]: number;
}

interface Interaction {
  category: string;
  timestamp: number;
}

interface CategoryFrequency {
  [key: string]: number;
}

interface PatternCache {
  [key: string]: boolean;
}

interface Insight {
  id: string;
  text: string;
  prefix: string;
  emphasis: string;
  timestamp: number;
  condition: boolean;
}

interface CategoryPercentage {
  category: string;
  time: number;
  percentage: number;
}

const MinimalBehaviorAnalyzer: React.FC = () => {
  const initialCategories: Categories = {
    'Cat Memes': { points: 5 },
    'Bear Videos': { points: 6 },
    'Tom Holland': { points: 7 },
    'Porridge': { points: 4 },
  };

  const [categories, setCategories] = useState<Categories>(initialCategories);
  const [newCategory, setNewCategory] = useState<string>('');
  const [showInput, setShowInput] = useState<boolean>(false);
  const [hoverTimes, setHoverTimes] = useState<HoverTimes>(
    Object.keys(initialCategories).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
  );
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [userId, setUserId] = useState<number>(0);
  const [lastInteractionTime, setLastInteractionTime] = useState<LastInteractionTime>({});
  const [interactionSequence, setInteractionSequence] = useState<Interaction[]>([]);
  const [categoryFrequency, setCategoryFrequency] = useState<CategoryFrequency>({});
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [patternCache, setPatternCache] = useState<PatternCache>({});

useEffect(() => {
  // These will only run on the client side
  setUserId(Math.floor(Math.random() * 100000));
  setSessionStartTime(Date.now());
}, []); 

  useEffect(() => {
    if (activeImage) {
      setLastInteractionTime(prev => ({
        ...prev,
        [activeImage]: Date.now()
      }));

      setInteractionSequence(prev => [...prev, {
        category: activeImage,
        timestamp: Date.now()
      }].slice(-10));
      
      setCategoryFrequency(prev => ({
        ...prev,
        [activeImage]: (prev[activeImage] || 0) + 1
      }));
    }
  }, [activeImage]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (activeImage) {
        setHoverTimes(prev => ({
          ...prev,
          [activeImage]: prev[activeImage] + 1
        }));
      }
      setTotalTime(prev => prev + 1);
    }, 100);
    
    return () => clearInterval(timer);
  }, [activeImage]);

  const generateInsight = (): Insight[] | null => {
    if (!activeImage) return null;

    const currentTime = hoverTimes[activeImage];
    const totalHoverTime = Object.values(hoverTimes).reduce((sum, time) => sum + time, 0);
    const percentage = (currentTime / totalHoverTime) * 100;
    const timeSinceLastInteraction = Date.now() - (lastInteractionTime[activeImage] || Date.now());
    const sessionDuration = (Date.now() - sessionStartTime) / 1000;
    
    const engagementScore = (currentTime / totalHoverTime) * 
      Math.log(1 + (categoryFrequency[activeImage] || 0)) * 
      (1 / Math.sqrt(1 + timeSinceLastInteraction / 1000));

    const recentSequence = interactionSequence
      .map(i => i.category)
      .join('-');
    
    const hasPattern = recentSequence.includes(`${activeImage}-${activeImage}`);
    const isNewPattern = !patternCache[recentSequence];
    
    if (isNewPattern) {
      setPatternCache(prev => ({
        ...prev,
        [recentSequence]: true
      }));
    }

    const patterns: Insight[] = [
      {
        condition: engagementScore > 0.5,
        text: `High engagement with ${activeImage}`,
        prefix: 'Critical',
        emphasis: `score ${engagementScore.toFixed(2)}`,
        timestamp: Date.now(),
        id: ''
      },
      {
        condition: currentTime > 50 && percentage > 40,
        text: `${activeImage} is primary focus`,
        prefix: 'Dominant',
        emphasis: `${Math.round(percentage)}% focus`,
        timestamp: Date.now(),
        id: ''
      },
      {
        condition: hasPattern && (categoryFrequency[activeImage] || 0) > 3,
        text: `Recurring interest in ${activeImage}`,
        prefix: 'Pattern',
        emphasis: `${categoryFrequency[activeImage]}x returns`,
        timestamp: Date.now(),
        id: ''
      },
      {
        condition: timeSinceLastInteraction < 2000 && currentTime > 30,
        text: `Deep dive into ${activeImage}`,
        prefix: 'Focused',
        emphasis: `${(currentTime / 10).toFixed(1)}s study`,
        timestamp: Date.now(),
        id: ''
      },
      {
        condition: sessionDuration > 30 && currentTime < 10,
        text: `Brief scanning of ${activeImage}`,
        prefix: 'Exploratory',
        emphasis: 'quick view',
        timestamp: Date.now(),
        id: ''
      },
      {
        condition: (categoryFrequency[activeImage] || 0) === 1,
        text: `First interaction with ${activeImage}`,
        prefix: 'New',
        emphasis: 'discovery',
        timestamp: Date.now(),
        id: ''
      },
      {
        condition: isNewPattern,
        text: `Unique navigation through ${activeImage}`,
        prefix: 'Novel',
        emphasis: 'sequence',
        timestamp: Date.now(),
        id: ''
      },
      {
        condition: Object.keys(categoryFrequency).length > 5,
        text: `Broad exploration including ${activeImage}`,
        prefix: 'Diverse',
        emphasis: `${Object.keys(categoryFrequency).length} categories`,
        timestamp: Date.now(),
        id: ''
      },
      {
        condition: percentage > 60 && totalHoverTime > 100,
        text: `${activeImage} dominates session`,
        prefix: 'Fixated',
        emphasis: `${Math.round(percentage)}% attention`,
        timestamp: Date.now(),
        id: ''
      },
      {
        condition: true,
        text: `Interaction with ${activeImage}`,
        prefix: 'Active',
        emphasis: `${(currentTime / 10).toFixed(1)}s`,
        timestamp: Date.now(),
        id: ''
      }
    ];

    return patterns
      .filter(pattern => pattern.condition)
      .slice(0, 2)
      .map(pattern => ({
        ...pattern,
        id: String(insights.length + 1).padStart(3, '0')
      }));
  };

  useEffect(() => {
    if (activeImage) {
      const newInsights = generateInsight();
      if (newInsights && newInsights.length > 0) {
        setInsights(prev => {
          const filtered = prev.filter(p => 
            !newInsights.some(ni => ni.text === p.text)
          );
          return [...newInsights, ...filtered].slice(0, 25);
        });
      }
    }
}, [activeImage, activeImage ? hoverTimes[activeImage] : null]);

  const calculatePercentages = (): CategoryPercentage[] => {
    const totalHoverTime = Object.values(hoverTimes).reduce((sum, time) => sum + time, 0);
    
    return Object.entries(hoverTimes)
      .map(([category, time]) => ({
        category,
        time,
        percentage: totalHoverTime > 0 
          ? Math.round((time / totalHoverTime) * 100) 
          : 0
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 4)
      .map((item, index, array) => {
        if (index === array.length - 1) {
          const currentSum = array.slice(0, -1).reduce((sum, i) => sum + i.percentage, 0);
          return {
            ...item,
            percentage: Math.max(0, 100 - currentSum)
          };
        }
        return item;
      });
  };

  const getPolygonPoints = (numPoints: number): string => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2;
      points.push({
        x: 50 + 30 * Math.cos(angle),
        y: 50 + 30 * Math.sin(angle)
      });
    }
    return points.map(p => `${p.x},${p.y}`).join(' ');
  };

  const getOverlappingPolygons = (): JSX.Element[] => {
    const totalShapes = Object.values(categories).length;
    const angleStep = (2 * Math.PI) / totalShapes;
    
    return Object.entries(categories).map(([category, config], index) => {
      // Base position on a circle
      const baseRadius = 15;
      const angle = index * angleStep;
      
      // Add randomization to both radius and angle
      const radiusJitter = Math.random() * 10 - 5; // Random value between -5 and 5
      const angleJitter = (Math.random() * 0.5 - 0.25); // Random angle adjustment ±0.25 radians
      
      // Calculate final position with jitter
      const radius = baseRadius + radiusJitter;
      const finalAngle = angle + angleJitter;
      
      const offsetX = radius * Math.cos(finalAngle);
      const offsetY = radius * Math.sin(finalAngle);
      
      // Scale based on hover time
      const baseScale = 0.7;
      const hoverScale = hoverTimes[category] ? Math.min(hoverTimes[category] / 100, 0.3) : 0;
      const scale = baseScale + hoverScale;

      return (
        <g key={`${category}-${Math.random()}`}>
          <polygon
            points={getPolygonPoints(config.points)}
            fill="#7FFF7F"
            fillOpacity={0.15}
            stroke="#7FFF7F"
            strokeWidth="0.5"
            className="transition-all duration-300"
          />
        </g>
      );
    });
  };

  const handleAddCategory = (): void => {
    if (newCategory.trim()) {
      const randomPoints = Math.floor(Math.random() * 7) + 3;
      setCategories(prev => ({
        ...prev,
        [newCategory]: { points: randomPoints }
      }));
      setHoverTimes(prev => ({
        ...prev,
        [newCategory]: 0
      }));
      setNewCategory('');
      setShowInput(false);
    }
  };

  return (
    <div className="min-h-screen font-mono p-4">
      <div className="flex justify-between text-sm mb-4">
        <span className="text-green-400">User Behavior</span>
        <span>Real-time Profile Generation</span>
      </div>

      {/* Changed grid-cols-3 to grid-cols-1 md:grid-cols-3 for responsive layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="border p-4 aspect-square">
            <div className="h-full flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full max-w-[400px] mx-auto">
                {getOverlappingPolygons()}
              </svg>
            </div>
            <div className="mt-2 text-sm">
              User #{userId}
              <br />
              ⏱ {(totalTime / 10).toFixed(1)}s [total time]
            </div>
          </div>
          <div className="border p-4">
            <h2 className="text-sm mb-2">Return This Content</h2>
            <div className="space-y-2">
              {calculatePercentages().map(({ category, percentage}) => (
                <div key={category} className="flex items-center text-sm gap-2">
                  <div className="w-24 truncate">{category}</div>
                  <div className="flex-1 relative h-1 bg-gray-100">
                    <div
                      className="absolute h-1 bg-green-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-right">{percentage}%</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Based on {(Object.values(hoverTimes).reduce((sum, time) => sum + time, 0) / 10).toFixed(1)}s total interaction time
            </div>
          </div>
        </div>

        {/* Middle column - Grid of interactive tiles */}
        <div className="border p-4">
          {/* Changed grid-cols-4 to be responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Object.entries(categories).map(([category, config]) => (
              <div
                key={category}
                className="border p-2"
                onMouseEnter={() => setActiveImage(category)}
                onMouseLeave={() => setActiveImage(null)}
              >
                <div className="aspect-square flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon
                      points={getPolygonPoints(config.points)}
                      fill="none"
                      stroke={activeImage === category ? '#7FFF7F' : '#000'}
                      strokeWidth="1"
                    />
                  </svg>
                </div>
                <div className="mt-1 text-xs text-center">
                  {category}
                  <br />
                  ⏱ {(hoverTimes[category] / 10).toFixed(1)}s
                </div>
              </div>
            ))}

            {/* Add New tile */}
            <div
              className="border p-2 cursor-pointer"
              onClick={() => !showInput && setShowInput(true)}
            >
              {showInput ? (
                <div className="h-full flex flex-col">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    className="border p-1 text-xs mb-1"
                    placeholder="Category name"
                    autoFocus
                  />
                  <div className="flex gap-1 text-xs">
                    <button
                      onClick={handleAddCategory}
                      className="flex-1 border hover:bg-green-400 hover:text-white"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowInput(false);
                        setNewCategory('');
                      }}
                      className="flex-1 border"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="aspect-square flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <polygon
                        points={getPolygonPoints(5)}
                        fill="none"
                        stroke="#000"
                        strokeWidth="1"
                      />
                    </svg>
                  </div>
                  <div className="mt-1 text-xs text-center">+ Add New</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="border p-4">
          <h2 className="text-sm mb-2">Insights Feed</h2>
          <div className="space-y-2 text-xs max-h-[400px] md:max-h-none overflow-y-auto">
            {insights.map((insight, index) => (
              <div key={index}>
                #{insight.id} {insight.prefix && <span className="text-green-400">{insight.prefix}</span>} {insight.text} {insight.emphasis && <span className="text-green-400">{insight.emphasis}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalBehaviorAnalyzer;