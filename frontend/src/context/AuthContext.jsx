import { useEffect, useState } from "react";
import { api, authTokenStorage } from "../lib/api";
import { AuthContext } from "./AuthContextValue";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => authTokenStorage.get());
  const [authReady, setAuthReady] = useState(() => !authTokenStorage.get());

  useEffect(() => {
    const currentToken = authTokenStorage.get();

    if (!currentToken) {
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
      .catch((error) => {
        if (error?.status === 401 || error?.status === 403) {
          authTokenStorage.clear();
          if (!ignore) {
            setToken(null);
            setUser(null);
          }
          return;
        }

        console.warn("Session refresh failed, but auth token was preserved.", error);

        if (!ignore) {
          setToken(currentToken);
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
    setToken(result.token);
    setUser(result.user);
    setAuthReady(true);
    return result.user;
  };

  const login = async (credentials) => completeAuth(await api.login(credentials));
  const signup = async (payload) => completeAuth(await api.signup(payload));

  const logout = () => {
    authTokenStorage.clear();
    setToken(null);
    setUser(null);
    setAuthReady(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAuthenticated: Boolean(token),
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
