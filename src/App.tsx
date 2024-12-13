import React, { useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";

// const app = initializeApp(JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG!));

const { apiKey, authDomain, projectId } = JSON.parse(
  process.env.REACT_APP_FIREBASE_CONFIG!
);
const app = initializeApp({
  apiKey,
  authDomain,
  projectId,
});

const App: React.FunctionComponent = () => {
  const [isErrored, setIsErrored] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const authContainerRef = useRef<HTMLDivElement | null>(null);

  const subdomain = window.location.hostname.split(".")[0];

  const logout = async () => {
    await getAuth(app).signOut();
    setUser(null);
  };

  useEffect(() => {
    const auth = getAuth(app);
    const setupAuthUI = async () => {
      try {
        onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
          } else {
            setUser(null);
            if (!firebaseui.auth.AuthUI.getInstance()) {
              const ui = new firebaseui.auth.AuthUI(auth);
              ui.start(authContainerRef.current as any, {
                signInFlow: "popup",
                signInOptions: [
                  {
                    provider: GoogleAuthProvider.PROVIDER_ID,
                  },
                ],
                credentialHelper: firebaseui.auth.CredentialHelper.NONE,
                callbacks: {
                  signInSuccessWithAuthResult: () => false,
                },
              });
            } else {
              const ui = firebaseui.auth.AuthUI.getInstance();
              ui!.start(authContainerRef.current as any, {
                signInFlow: "popup",
                signInOptions: [
                  {
                    provider: GoogleAuthProvider.PROVIDER_ID,
                  },
                ],
                credentialHelper: firebaseui.auth.CredentialHelper.NONE,
                callbacks: {
                  signInSuccessWithAuthResult: () => false,
                },
              });
            }
            setIsAuthLoaded(true);
          }
        });

        const faviconLink = document.querySelector("link[rel='icon']");
        if (faviconLink) {
          (faviconLink as any).href = `/favicon/${subdomain}.ico`;
        }
      } catch (error) {
        setIsErrored(true);
      }
    };

    setupAuthUI();
  }, [subdomain]);

  return (
    <div className="parent-container">
      {isErrored && <div>Error! Please refresh and try again!</div>}
      {!isAuthLoaded && !isErrored && (
        <div className="mt-6">
          {/* Replace with a spinner or progress indicator component */}
          <div className="spinner">Loading...</div>
        </div>
      )}
      {!!user ? (
        <div>
          <div style={{ width: "60px" }}>{user?.displayName}</div>
          {<button onClick={logout}> Log out</button>}
        </div>
      ) : (
        <div>
          <div>You are logged out</div>
          <div>Welcome!</div>
        </div>
      )}
      <div id="auth-container" ref={authContainerRef} />
    </div>
  );
};

export default App;
