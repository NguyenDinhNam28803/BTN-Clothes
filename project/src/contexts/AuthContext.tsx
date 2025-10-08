import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: { full_name?: string; phone?: string; dob?: string | null; avatar_url?: string | null }) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error && data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (profileData: { full_name?: string; phone?: string; dob?: string | null; avatar_url?: string | null }) => {
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    // Create a new object with only the properties that are provided in profileData
    // This is to avoid issues with schema cache for columns that might not exist yet
    const cleanedData: Record<string, string | null> = {};
    
    // Always include these basic fields if they exist in profileData
    // Use hasOwnProperty to check if the key exists in the object, even if value is empty string or null
    if (Object.prototype.hasOwnProperty.call(profileData, 'full_name')) cleanedData.full_name = profileData.full_name || '';
    if (Object.prototype.hasOwnProperty.call(profileData, 'phone')) cleanedData.phone = profileData.phone || '';
    if (Object.prototype.hasOwnProperty.call(profileData, 'avatar_url')) cleanedData.avatar_url = profileData.avatar_url || null;
    
    // Completely ignore the dob field since it doesn't exist in the database yet
    // We'll only work with the fields that we know exist
    
    // Try updating with a timeout to handle connection issues
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Try updating profile - only with fields we know exist
      const { error } = await supabase
        .from('profiles')
        .update(cleanedData)
        .eq('id', user.id);
      
      clearTimeout(timeoutId);

      // Skip DOB update completely to avoid errors
      
      // Update user metadata in localStorage as a fallback for offline usage
      try {
        // Save profile data to localStorage for fallback when offline
        localStorage.setItem('userProfile', JSON.stringify({
          ...cleanedData,
          email: user.email,
          dob: profileData.dob,
          id: user.id,
          updated_at: new Date().toISOString()
        }));
      } catch (localStorageError) {
        console.log("Failed to save profile to localStorage:", localStorageError);
      }
      
      return { error };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
