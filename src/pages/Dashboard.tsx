import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db, APP_ID } from '../firebase/config';
import { Users, AlertCircle, Car, Activity, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock chart data representing onboarded drivers over time
const mockChartData = [
  { month: 'Jan', onboarded: 5 },
  { month: 'Feb', onboarded: 10 },
  { month: 'Mar', onboarded: 8 },
  { month: 'Apr', onboarded: 12 },
  { month: 'May', onboarded: 7 },
  { month: 'Jun', onboarded: 15 },
  { month: 'Jul', onboarded: 9 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    activeDrivers: 0,
    idleDrivers: 0,
    alertsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const driversRef = collection(db, 'artifacts', APP_ID, 'appData', 'drivers');
        const alertsRef = collection(db, 'artifacts', APP_ID, 'appData', 'alerts');
        
        const [driversSnap, alertsSnap] = await Promise.all([
          getDocs(driversRef),
          getDocs(query(alertsRef, where('resolved', '==', false)))
        ]);

        let active = 0;
        let idle = 0;

        driversSnap.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'active') active++;
          if (data.status === 'idle' || data.status === 'vacation') idle++;
        });

        setStats({
          totalDrivers: driversSnap.size,
          activeDrivers: active,
          idleDrivers: idle,
          alertsCount: alertsSnap.size
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline">Download Report</Button>
          <Button>Onboard Driver</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="rounded-full p-3 bg-indigo-50">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Drivers</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalDrivers}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="rounded-full p-3 bg-emerald-50">
              <Activity className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Active</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.activeDrivers}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="rounded-full p-3 bg-amber-50">
              <Car className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Idle / Vacation</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.idleDrivers}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="rounded-full p-3 bg-red-50">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Active Alerts</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.alertsCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Onboarding Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="onboarded" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.alertsCount === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <ShieldAlert className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                  <p>No active alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
