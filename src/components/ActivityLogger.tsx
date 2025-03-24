
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';

// Types for activity tracking
export interface LLMActivity {
  id: string;
  type: 'processing' | 'recommendation' | 'search' | 'match';
  description: string;
  timestamp: Date;
  details?: {
    inputText?: string;
    matchedItems?: string[];
    unmatchedItems?: string[];
    recommendations?: string[];
    confidence?: number;
  };
}

// Mock data generator for activity logs
const generateMockLLMActivities = (): LLMActivity[] => {
  return [
    {
      id: '1',
      type: 'processing',
      description: 'Processed natural language grocery list',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      details: {
        inputText: '2 avocados, 1 loaf of bread, milk, 6 eggs',
        matchedItems: ['Avocado', 'Whole Wheat Bread', 'Organic Milk', 'Free-Range Eggs'],
        unmatchedItems: [],
      }
    },
    {
      id: '2',
      type: 'recommendation',
      description: 'Generated product recommendations',
      timestamp: new Date(Date.now() - 1000 * 60 * 4), // 4 minutes ago
      details: {
        recommendations: ['Greek Yogurt', 'Organic Spinach', 'Honey']
      }
    },
    {
      id: '3',
      type: 'search',
      description: 'Processed semantic search query',
      timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      details: {
        inputText: 'healthy breakfast options',
        confidence: 0.92
      }
    },
    {
      id: '4',
      type: 'match',
      description: 'Matched ambiguous product description',
      timestamp: new Date(Date.now() - 1000 * 60), // 1 minute ago
      details: {
        inputText: 'cereal',
        matchedItems: ['Organic Granola', 'Whole Grain Cereal', 'Bran Flakes'],
        confidence: 0.85
      }
    }
  ];
};

// Activity logger component
export const ActivityLogger: React.FC = () => {
  const [activities, setActivities] = useState<LLMActivity[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    // In a real app, this would subscribe to real-time LLM activities
    setActivities(generateMockLLMActivities());
    
    // Simulate new activity coming in
    const timer = setTimeout(() => {
      setActivities(prev => [
        {
          id: '5',
          type: 'processing',
          description: 'Analyzed shopping patterns',
          timestamp: new Date(),
          details: {
            confidence: 0.94
          }
        },
        ...prev
      ]);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const filteredActivities = activeTab === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === activeTab);
  
  const getActivityColor = (type: LLMActivity['type']) => {
    switch (type) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'recommendation': return 'bg-green-100 text-green-800';
      case 'search': return 'bg-purple-100 text-purple-800';
      case 'match': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="recommendation">Recommendations</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="match">Matching</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <div className="space-y-4">
              {filteredActivities.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No activities recorded yet</p>
              ) : (
                filteredActivities.map(activity => (
                  <div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getActivityColor(activity.type)}>
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="font-medium">{activity.description}</p>
                    
                    {activity.details && (
                      <div className="mt-2 text-sm text-gray-600">
                        {activity.details.inputText && (
                          <p><span className="font-semibold">Input:</span> "{activity.details.inputText}"</p>
                        )}
                        {activity.details.matchedItems && activity.details.matchedItems.length > 0 && (
                          <p><span className="font-semibold">Matched:</span> {activity.details.matchedItems.join(', ')}</p>
                        )}
                        {activity.details.unmatchedItems && activity.details.unmatchedItems.length > 0 && (
                          <p><span className="font-semibold">Unmatched:</span> {activity.details.unmatchedItems.join(', ')}</p>
                        )}
                        {activity.details.recommendations && (
                          <p><span className="font-semibold">Recommended:</span> {activity.details.recommendations.join(', ')}</p>
                        )}
                        {activity.details.confidence !== undefined && (
                          <p><span className="font-semibold">Confidence:</span> {(activity.details.confidence * 100).toFixed(1)}%</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
