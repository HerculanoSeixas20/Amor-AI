import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Inicializar aplicação Firebase evitando duplicação
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicializar base de dados e autenticação
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Configurar provedor Google
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Testar ligação com Firestore
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "users", "connection_test"));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore offline ou a ligar.");
    }
    return false;
  }
}

// Iniciar sessão com Google via Popup do Firebase
export async function signInWithGooglePopup(): Promise<{
  email: string;
  name: string;
  avatar: string;
  uid: string;
}> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return {
    email: (user.email || "").toLowerCase().trim(),
    name: user.displayName || user.email?.split("@")[0] || "Utilizador Google",
    avatar: user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    uid: user.uid
  };
}

export async function logOutFromFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.error("Erro ao terminar sessão no Firebase:", err);
  }
}
