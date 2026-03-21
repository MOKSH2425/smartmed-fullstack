import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data: Heart Rate over the last 7 days
const data = [
  { day: 'Mon', bpm: 72 },
  { day: 'Tue', bpm: 75 },
  { day: 'Wed', bpm: 71 },
  { day: 'Thu', bpm: 80 },
  { day: 'Fri', bpm: 76 },
  { day: 'Sat', bpm: 74 },
  { day: 'Sun', bpm: 70 },
];

const HealthChart = () => {
  return (
    <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0 }}>❤️ Heart Rate Trends</h3>
        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Last 7 Days</span>
      </div>

      {/* The Chart Container - ResponsiveContainer makes it resize automatically */}
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" vertical={false} />
            <XAxis dataKey="day" stroke="#9ca3af" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            
            {/* The Tooltip shows specific numbers when you hover */}
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
            />
            
            {/* The Line itself */}
            <Line 
              type="monotone" 
              dataKey="bpm" 
              stroke="#ef4444" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.9rem', textAlign: 'center' }}>
        Average Heart Rate: <strong>74 BPM</strong> (Normal)
      </p>
    </div>
  );
};

export default HealthChart;