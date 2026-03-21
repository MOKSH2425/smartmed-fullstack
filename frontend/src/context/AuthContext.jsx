import { useEffect, useState } from "react";
import { api, authTokenStorage } from "../lib/api";
import { AuthContext } from "./AuthContextValue";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(() => !authTokenStorage.get());

  useEffect(() => {
    const token = authTokenStorage.get();

    if (!token) {
      return undefined;
    }

    let ignore = false;

    api
      .getCurrentUser()
      .then((data) => {
        if (!ignore) {
          setUser(data.user);
        }
      })
      .catch(() => {
        authTokenStorage.clear();
        if (!ignore) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setAuthReady(true);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const completeAuth = (result) => {
    authTokenStorage.set(result.token);
    setUser(result.user);
    setAuthReady(true);
    return result.user;
  };

  const login = async (credentials) => completeAuth(await api.login(credentials));
  const signup = async (payload) => completeAuth(await api.signup(payload));

  const logout = () => {
    authTokenStorage.clear();
    setUser(null);
    setAuthReady(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
