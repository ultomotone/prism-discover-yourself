import React from "react";
import Header from "@/components/Header";

const DashboardTest = () => {
  console.log('✅ DashboardTest component rendered successfully');
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container py-8">
        <h1 className="text-3xl font-bold text-primary mb-4">Dashboard Test</h1>
        <p className="text-muted-foreground">
          This is a test version of the dashboard to check if routing works.
        </p>
      </div>
    </div>
  );
};

export default DashboardTest;