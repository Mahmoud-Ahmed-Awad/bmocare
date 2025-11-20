import React from 'react';
import { UserStats } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { X, Trash2 } from 'lucide-react';

interface Props {
  stats: UserStats;
  onClose: () => void;
  onReset: () => void;
}

export const ParentDashboard: React.FC<Props> = ({ stats, onClose, onReset }) => {
  const data = [
    { name: 'Correct', value: stats.correct },
    { name: 'Incorrect', value: stats.incorrect },
  ];

  const COLORS = ['#22c55e', '#ef4444'];

  // Calculate engagement (simple metric based on total attempts)
  const totalAttempts = stats.correct + stats.incorrect;
  const engagementLevel = totalAttempts > 20 ? 'High' : totalAttempts > 10 ? 'Medium' : 'Low';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">Parent Dashboard</h2>
          <button onClick={onClose} className="hover:bg-slate-700 p-2 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-blue-600 font-semibold">Learner</p>
              <p className="text-2xl font-bold text-slate-800">{stats.name || 'Guest'}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <p className="text-sm text-purple-600 font-semibold">Engagement</p>
              <p className="text-2xl font-bold text-slate-800">{engagementLevel}</p>
            </div>
          </div>

          <div className="h-64 w-full bg-slate-50 rounded-xl p-4">
            <p className="text-center text-slate-500 mb-2 text-sm font-medium">Performance</p>
            {totalAttempts > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No activity yet
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset progress?')) {
                onReset();
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-100 text-red-500 hover:bg-red-50 font-semibold transition-colors"
          >
            <Trash2 size={20} />
            Reset User Data
          </button>
        </div>
      </div>
    </div>
  );
};