import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";

type User = {
  _id: string;      
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar: string;
  active?: Boolean;
  role: string;
  authProvider?: 'google' | 'emailPassword';
} | null;

type UserContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
    return null;
  });
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
