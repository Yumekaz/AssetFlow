import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

export const OverdueList: React.FC = () => {
  // Mock data for visual verification
  const overdueItems = [
    {
      id: '1',
      assetName: 'MacBook Pro 14"',
      assetTag: 'AF-0042',
      employee: 'Sarah Jenkins',
      daysOverdue: 3,
    },
    {
      id: '2',
      assetName: 'Epson Projector',
      assetTag: 'AF-0015',
      employee: 'Marketing Dept',
      daysOverdue: 1,
    }
  ];

  if (overdueItems.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
      <div className="bg-red-50/50 p-5 border-b border-red-100 flex items-center gap-3">
        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h3 className="font-bold text-red-900">Action Required</h3>
          <p className="text-sm text-red-700">The following allocations are overdue for return.</p>
        </div>
      </div>
      
      <div className="divide-y divide-slate-100">
        {overdueItems.map((item) => (
          <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div>
              <p className="font-semibold text-slate-800">{item.assetName} <span className="text-slate-400 font-normal ml-2">{item.assetTag}</span></p>
              <p className="text-sm text-slate-500 mt-1">Holder: {item.employee}</p>
            </div>
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-sm font-medium">
              <Clock size={16} />
              {item.daysOverdue} {item.daysOverdue === 1 ? 'day' : 'days'} overdue
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
