import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, APP_ID } from '../firebase/config';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '../components/ui';
import { UserPlus, Search } from 'lucide-react';

interface Driver {
  cwdsId: string;
  name: string;
  passport: string;
  visa: string;
  status: string;
  client: string;
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboard, setShowOnboard] = useState(false);
  const [search, setSearch] = useState('');

  // Form states
  const [cwdsId, setCwdsId] = useState('');
  const [name, setName] = useState('');
  const [passport, setPassport] = useState('');
  const [visa, setVisa] = useState('');

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'artifacts', APP_ID, 'appData', 'drivers'));
      const data = snap.docs.map(doc => doc.data() as Driver);
      setDrivers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cwdsId || !name) return;
    try {
      const docRef = doc(db, 'artifacts', APP_ID, 'appData', 'drivers', cwdsId);
      await setDoc(docRef, {
        cwdsId,
        name,
        passport,
        visa,
        status: 'pending',
        client: '',
        trainingFee: 1000,
        balance: 0,
        fines: 0,
        advances: 0
      });
      setShowOnboard(false);
      fetchDrivers();
      setCwdsId('');
      setName('');
      setPassport('');
      setVisa('');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.cwdsId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Driver Management</h1>
        <Button onClick={() => setShowOnboard(!showOnboard)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Onboard New Driver
        </Button>
      </div>

      {showOnboard && (
        <Card className="bg-slate-50 border-dashed border-2 border-slate-300">
          <CardHeader>
            <CardTitle>Onboard Driver</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOnboard} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">CWDS ID</label>
                <Input required value={cwdsId} onChange={e => setCwdsId(e.target.value)} placeholder="e.g., CWDS-001" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Passport Number</label>
                <Input required value={passport} onChange={e => setPassport(e.target.value)} placeholder="P1234567" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Visa Type</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={visa}
                  onChange={e => setVisa(e.target.value)}
                  required
                >
                  <option value="">Select Visa Type</option>
                  <option value="company">Company Provided</option>
                  <option value="own">Own Visa</option>
                </select>
              </div>
              <div className="md:col-span-2 pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowOnboard(false)}>Cancel</Button>
                <Button type="submit">Submit Onboarding</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="p-4 border-b border-slate-200 flex items-center bg-slate-50 rounded-t-lg">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search drivers..." 
              className="pl-9 bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : filteredDrivers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No drivers found</td></tr>
              ) : (
                filteredDrivers.map(d => (
                  <tr key={d.cwdsId} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{d.cwdsId}</td>
                    <td className="px-6 py-4">{d.name}</td>
                    <td className="px-6 py-4">
                      {d.client ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {d.client}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize
                        ${d.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 
                          d.status === 'pending' ? 'bg-amber-50 text-amber-700' : 
                          'bg-slate-100 text-slate-700'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" className="h-8 px-3 text-xs">Manage</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
