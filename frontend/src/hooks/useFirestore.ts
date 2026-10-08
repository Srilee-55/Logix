import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, doc } from 'firebase/firestore';
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
    let unsub: (() => void) | null = null;
    let isMounted = true;

    async function loadData() {
      if (db) {
        try {
          const collRef = collection(db, 'orders');
          const q = query(collRef);
          unsub = onSnapshot(
            q,
            async (snapshot) => {
              let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
              if (riskFilter && list.length > 0) {
                list = list.filter((o: any) => o.riskLevel?.toUpperCase() === riskFilter.toUpperCase());
              }
              if (list.length > 0) {
                if (isMounted) {
                  setOrders(list);
                  setLoading(false);
                }
              } else {
                try {
                  const apiOrders = await fetchOrders(riskFilter);
                  if (isMounted) {
                    setOrders(apiOrders || []);
                  }
                } catch (e: any) {
                  if (isMounted) setError(e.message);
                } finally {
                  if (isMounted) setLoading(false);
                }
              }
            },
            async (err) => {
              console.warn('Firestore orders snapshot error, falling back to API:', err);
              try {
                const apiOrders = await fetchOrders(riskFilter);
                if (isMounted) setOrders(apiOrders || []);
              } catch (e: any) {
                if (isMounted) setError(e.message);
              } finally {
                if (isMounted) setLoading(false);
              }
            }
          );
          return;
        } catch (err: any) {
          console.warn('Firestore subscription exception, falling back to API:', err);
        }
      }

      try {
        const apiOrders = await fetchOrders(riskFilter);
        if (isMounted) setOrders(apiOrders || []);
      } catch (e: any) {
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
  }, [user, riskFilter]);

  return { orders, loading, error };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let isMounted = true;

    async function loadData() {
      if (db) {
        try {
          const q = collection(db, 'customers');
          unsub = onSnapshot(
            q,
            async (snapshot) => {
              const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
              if (list.length > 0) {
                if (isMounted) {
                  setCustomers(list);
                  setLoading(false);
                }
              } else {
                try {
                  const apiCust = await fetchCustomers();
                  if (isMounted) setCustomers(apiCust || []);
                } catch (e: any) {
                  if (isMounted) setError(e.message);
                } finally {
                  if (isMounted) setLoading(false);
                }
              }
            },
            async (err) => {
              try {
                const apiCust = await fetchCustomers();
                if (isMounted) setCustomers(apiCust || []);
              } catch (e: any) {
                if (isMounted) setError(e.message);
              } finally {
                if (isMounted) setLoading(false);
              }
            }
          );
          return;
        } catch {}
      }

      try {
        const apiCust = await fetchCustomers();
        if (isMounted) setCustomers(apiCust || []);
      } catch (e: any) {
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
  }, []);

  return { customers, loading, error };
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let isMounted = true;

    async function loadData() {
      if (db) {
        try {
          const q = collection(db, 'vehicles');
          unsub = onSnapshot(
            q,
            async (snapshot) => {
              const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
              if (list.length > 0) {
                if (isMounted) {
                  setVehicles(list);
                  setLoading(false);
                }
              } else {
                try {
                  const apiVeh = await fetchVehicles();
                  if (isMounted) setVehicles(apiVeh || []);
                } catch (e: any) {
                  if (isMounted) setError(e.message);
                } finally {
                  if (isMounted) setLoading(false);
                }
              }
            },
            async () => {
              try {
                const apiVeh = await fetchVehicles();
                if (isMounted) setVehicles(apiVeh || []);
              } catch (e: any) {
                if (isMounted) setError(e.message);
              } finally {
                if (isMounted) setLoading(false);
              }
            }
          );
          return;
        } catch {}
      }

      try {
        const apiVeh = await fetchVehicles();
        if (isMounted) setVehicles(apiVeh || []);
      } catch (e: any) {
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
  }, []);

  return { vehicles, loading, error };
}

export function useDrivers() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let isMounted = true;

    async function loadData() {
      if (db) {
        try {
          const q = collection(db, 'drivers');
          unsub = onSnapshot(
            q,
            async (snapshot) => {
              const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
              if (list.length > 0) {
                if (isMounted) {
                  setDrivers(list);
                  setLoading(false);
                }
              } else {
                try {
                  const apiDrv = await fetchDrivers();
                  if (isMounted) setDrivers(apiDrv || []);
                } catch (e: any) {
                  if (isMounted) setError(e.message);
                } finally {
                  if (isMounted) setLoading(false);
                }
              }
            },
            async () => {
              try {
                const apiDrv = await fetchDrivers();
                if (isMounted) setDrivers(apiDrv || []);
              } catch (e: any) {
                if (isMounted) setError(e.message);
              } finally {
                if (isMounted) setLoading(false);
              }
            }
          );
          return;
        } catch {}
      }

      try {
        const apiDrv = await fetchDrivers();
        if (isMounted) setDrivers(apiDrv || []);
      } catch (e: any) {
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
  }, []);

  return { drivers, loading, error };
}

export function usePackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let isMounted = true;

    async function loadData() {
      if (db) {
        try {
          const q = collection(db, 'packages');
          unsub = onSnapshot(
            q,
            async (snapshot) => {
              const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
              if (list.length > 0) {
                if (isMounted) {
                  setPackages(list);
                  setLoading(false);
                }
              } else {
                try {
                  const apiPkg = await fetchPackages();
                  if (isMounted) setPackages(apiPkg || []);
                } catch (e: any) {
                  if (isMounted) setError(e.message);
                } finally {
                  if (isMounted) setLoading(false);
                }
              }
            },
            async () => {
              try {
                const apiPkg = await fetchPackages();
                if (isMounted) setPackages(apiPkg || []);
              } catch (e: any) {
                if (isMounted) setError(e.message);
              } finally {
                if (isMounted) setLoading(false);
              }
            }
          );
          return;
        } catch {}
      }

      try {
        const apiPkg = await fetchPackages();
        if (isMounted) setPackages(apiPkg || []);
      } catch (e: any) {
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
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
    let unsub: (() => void) | null = null;
    let isMounted = true;

    async function loadData() {
      if (db) {
        try {
          const q = collection(db, 'risk_analysis');
          unsub = onSnapshot(
            q,
            async (snapshot) => {
              const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
              if (list.length > 0) {
                if (isMounted) {
                  setRiskAnalysis(list);
                  setLoading(false);
                }
              } else {
                try {
                  const data = await fetchRiskSummary();
                  if (isMounted) setRiskAnalysis([data]);
                } catch (e: any) {
                  if (isMounted) setError(e.message);
                } finally {
                  if (isMounted) setLoading(false);
                }
              }
            },
            async () => {
              try {
                const data = await fetchRiskSummary();
                if (isMounted) setRiskAnalysis([data]);
              } catch (e: any) {
                if (isMounted) setError(e.message);
              } finally {
                if (isMounted) setLoading(false);
              }
            }
          );
          return;
        } catch {}
      }

      try {
        const data = await fetchRiskSummary();
        if (isMounted) setRiskAnalysis([data]);
      } catch (e: any) {
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
  }, []);

  return { riskAnalysis, loading, error };
}

export function useOperationalInsights() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let isMounted = true;

    async function loadData() {
      if (db) {
        try {
          unsub = onSnapshot(
            doc(db, 'operational_insights', 'DAILY_INSIGHTS'),
            async (snapshot) => {
              if (snapshot.exists()) {
                if (isMounted) {
                  setInsights({ id: snapshot.id, ...snapshot.data() });
                  setLoading(false);
                }
              } else {
                try {
                  const apiInsights = await fetchInsights();
                  if (isMounted) setInsights(apiInsights);
                } catch (e: any) {
                  if (isMounted) setError(e.message);
                } finally {
                  if (isMounted) setLoading(false);
                }
              }
            },
            async () => {
              try {
                const apiInsights = await fetchInsights();
                if (isMounted) setInsights(apiInsights);
              } catch (e: any) {
                if (isMounted) setError(e.message);
              } finally {
                if (isMounted) setLoading(false);
              }
            }
          );
          return;
        } catch {}
      }

      try {
        const apiInsights = await fetchInsights();
        if (isMounted) setInsights(apiInsights);
      } catch (e: any) {
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
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
