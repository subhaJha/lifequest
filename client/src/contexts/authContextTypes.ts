export type User = {
  _id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  gold: number;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
};

