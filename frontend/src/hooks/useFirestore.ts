import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import {
  fetchOrders, fetchCustomers, fetchVehicles, fetchDrivers,
  fetchPackages, fetchInsights, fetchRiskSummary
} from '../services/api';

export function useUsers() {
  const { user } = useAuth();
  const [usersData, setUsersData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setUsersData([]);
      setLoading(false);
      return;
    }

    if (db) {
      try {
        const q = collection(db, 'users');
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setUsersData(list);
            setLoading(false);
          },
          (err) => {
            console.warn('Firestore users snapshot error:', err);
            setError(err.message);
            setLoading(false);
          }
        );
        return () => unsub();
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    } else {
      setUsersData(user ? [{ id: (user as any).user_id || 'user_1', ...user }] : []);
      setLoading(false);
    }
  }, [user]);

  return { users: usersData, loading, error };
}

export function useOrders(riskFilter?: string) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (db) {
      try {
        const collRef = collection(db, 'orders');
        const q = query(collRef);
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            if (riskFilter) {
              list = list.filter((o: any) => o.riskLevel?.toUpperCase() === riskFilter.toUpperCase());
            }
            setOrders(list);
            setLoading(false);
          },
          (err) => {
            console.warn('Firestore orders snapshot error, falling back to API:', err);
            fetchOrders(riskFilter).then(setOrders).catch((e) => setError(e.message)).finally(() => setLoading(false));
          }
        );
        return () => unsub();
      } catch (err: any) {
        fetchOrders(riskFilter).then(setOrders).catch((e) => setError(e.message)).finally(() => setLoading(false));
      }
    } else {
      fetchOrders(riskFilter).then(setOrders).catch((e) => setError(e.message)).finally(() => setLoading(false));
    }
  }, [user, riskFilter]);

  return { orders, loading, error };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (db) {
      try {
        const q = collection(db, 'customers');
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setCustomers(list);
            setLoading(false);
          },
          (err) => {
            fetchCustomers().then(setCustomers).catch((e) => setError(e.message)).finally(() => setLoading(false));
          }
        );
        return () => unsub();
      } catch {
        fetchCustomers().then(setCustomers).catch((e) => setError(e.message)).finally(() => setLoading(false));
      }
    } else {
      fetchCustomers().then(setCustomers).catch((e) => setError(e.message)).finally(() => setLoading(false));
    }
  }, []);

  return { customers, loading, error };
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (db) {
      try {
        const q = collection(db, 'vehicles');
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setVehicles(list);
            setLoading(false);
          },
          (err) => {
            fetchVehicles().then(setVehicles).catch((e) => setError(e.message)).finally(() => setLoading(false));
          }
        );
        return () => unsub();
      } catch {
        fetchVehicles().then(setVehicles).catch((e) => setError(e.message)).finally(() => setLoading(false));
      }
    } else {
      fetchVehicles().then(setVehicles).catch((e) => setError(e.message)).finally(() => setLoading(false));
    }
  }, []);

  return { vehicles, loading, error };
}

export function useDrivers() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (db) {
      try {
        const q = collection(db, 'drivers');
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setDrivers(list);
            setLoading(false);
          },
          (err) => {
            fetchDrivers().then(setDrivers).catch((e) => setError(e.message)).finally(() => setLoading(false));
          }
        );
        return () => unsub();
      } catch {
        fetchDrivers().then(setDrivers).catch((e) => setError(e.message)).finally(() => setLoading(false));
      }
    } else {
      fetchDrivers().then(setDrivers).catch((e) => setError(e.message)).finally(() => setLoading(false));
    }
  }, []);

  return { drivers, loading, error };
}

export function usePackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (db) {
      try {
        const q = collection(db, 'packages');
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setPackages(list);
            setLoading(false);
          },
          (err) => {
            fetchPackages().then(setPackages).catch((e) => setError(e.message)).finally(() => setLoading(false));
          }
        );
        return () => unsub();
      } catch {
        fetchPackages().then(setPackages).catch((e) => setError(e.message)).finally(() => setLoading(false));
      }
    } else {
      fetchPackages().then(setPackages).catch((e) => setError(e.message)).finally(() => setLoading(false));
    }
  }, []);

  return { packages, loading, error };
}

export function usePredictions() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (db) {
      try {
        const q = collection(db, 'predictions');
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setPredictions(list);
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          }
        );
        return () => unsub();
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  return { predictions, loading, error };
}

export function useRiskAnalysis() {
  const [riskAnalysis, setRiskAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (db) {
      try {
        const q = collection(db, 'risk_analysis');
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setRiskAnalysis(list);
            setLoading(false);
          },
          (err) => {
            fetchRiskSummary().then((data) => setRiskAnalysis([data])).catch((e) => setError(e.message)).finally(() => setLoading(false));
          }
        );
        return () => unsub();
      } catch {
        fetchRiskSummary().then((data) => setRiskAnalysis([data])).catch((e) => setError(e.message)).finally(() => setLoading(false));
      }
    } else {
      fetchRiskSummary().then((data) => setRiskAnalysis([data])).catch((e) => setError(e.message)).finally(() => setLoading(false));
    }
  }, []);

  return { riskAnalysis, loading, error };
}

export function useOperationalInsights() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (db) {
      try {
        const unsub = onSnapshot(
          doc(db, 'operational_insights', 'DAILY_INSIGHTS'),
          (snapshot) => {
            if (snapshot.exists()) {
              setInsights({ id: snapshot.id, ...snapshot.data() });
            } else {
              setInsights(null);
            }
            setLoading(false);
          },
          (err) => {
            fetchInsights().then(setInsights).catch((e) => setError(e.message)).finally(() => setLoading(false));
          }
        );
        return () => unsub();
      } catch {
        fetchInsights().then(setInsights).catch((e) => setError(e.message)).finally(() => setLoading(false));
      }
    } else {
      fetchInsights().then(setInsights).catch((e) => setError(e.message)).finally(() => setLoading(false));
    }
  }, []);

  return { insights, loading, error };
}

export function useUploads() {
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (db) {
      try {
        const q = collection(db, 'uploads');
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setUploads(list);
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          }
        );
        return () => unsub();
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  return { uploads, loading, error };
}
