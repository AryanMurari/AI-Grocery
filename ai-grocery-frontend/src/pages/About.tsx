
import React from 'react';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityLogger } from '@/components/ActivityLogger';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header cartItemCount={0} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="py-12 text-center animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 tracking-tight text-gradient">
            About SmartGrocery
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            An innovative AI-driven platform designed to revolutionize grocery shopping with natural language processing.
          </p>
        </div>
        
        <div className="py-8 glassmorphism rounded-xl animate-fade-in">
          <div className="max-w-4xl mx-auto px-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Key Features</TabsTrigger>
                <TabsTrigger value="technology">Technology</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Smart Grocery Order Processing System</CardTitle>
                    <CardDescription>AI-powered grocery shopping assistant</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      SmartGrocery is an innovative AI-driven platform designed to revolutionize the way you shop for groceries. 
                      The system combines advanced natural language processing with intelligent product recommendations to make 
                      grocery shopping faster, more intuitive, and personalized to your preferences.
                    </p>
                    <p>
                      Our platform allows you to create grocery orders using natural language - simply type or speak your 
                      grocery list as you would say it to another person, and our AI will intelligently interpret your 
                      request and match it with available products.
                    </p>
                    <p>
                      Whether you're planning meals for the week, restocking essentials, or exploring new products, 
                      SmartGrocery streamlines the entire process with powerful AI assistance and a user-friendly interface.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="features" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                    <CardDescription>What makes SmartGrocery special</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 list-disc pl-5">
                      <li><span className="font-medium">Natural Language Order Processing:</span> Type or speak your grocery list in everyday language, and our AI will understand and process it.</li>
                      <li><span className="font-medium">Intelligent Product Matching:</span> Our semantic search capabilities match your requests with the most relevant products.</li>
                      <li><span className="font-medium">Smart Recommendations:</span> Get personalized product recommendations based on your shopping habits and current cart items.</li>
                      <li><span className="font-medium">Efficient Order Management:</span> Easily review, modify, and complete your orders with a streamlined interface.</li>
                      <li><span className="font-medium">Semantic Search:</span> Find products quickly with our advanced search functionality that understands context and meaning.</li>
                      <li><span className="font-medium">Voice Input Support:</span> Speak your grocery list for hands-free order creation.</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="technology" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Technology Stack</CardTitle>
                    <CardDescription>The power behind SmartGrocery</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Frontend</h4>
                        <p>Built with React.js and Tailwind CSS for a responsive, modern user interface with smooth interactions and animations.</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">AI and NLP</h4>
                        <p>Leverages advanced language models for natural language understanding and processing of user input.</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Vector Database</h4>
                        <p>Uses vector embeddings to enable semantic search capabilities for accurate product matching.</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Data Processing</h4>
                        <p>Comprehensive product cataloging with rich metadata for intelligent recommendations and matching.</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Implementation Phases</h4>
                        <ol className="list-decimal pl-5 space-y-1">
                          <li>Data Preparation - Comprehensive product database creation</li>
                          <li>Vector Database Setup - Semantic search optimization</li>
                          <li>LLM Integration - Natural language understanding</li>
                          <li>Order Processing System - Intelligent matching and recommendations</li>
                          <li>Frontend Development - User-friendly interface design</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4 text-gradient">LLM Activity Tracking</h2>
              <ActivityLogger />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
