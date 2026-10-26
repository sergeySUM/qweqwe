import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../firebase/config';
import { storageService } from './storageService';
import { User, UserRole } from '../types/hospital';

export interface GoogleAuthResult {
  success: boolean;
  user?: User;
  firebaseUser?: FirebaseUser;
  error?: string;
  isDomainError?: boolean;
}

class AuthService {
  private currentFirebaseUser: FirebaseUser | null = null;
  private listeners: Set<(user: FirebaseUser | null) => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    try {
      onAuthStateChanged(auth, (fbUser) => {
        this.currentFirebaseUser = fbUser;
        if (fbUser && fbUser.email) {
          this.syncFirebaseUserWithHospital(fbUser);
        }
        this.notifyListeners();
      });
    } catch (e) {
      console.warn('Firebase Auth state listener error:', e);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn(this.currentFirebaseUser));
  }

  public subscribe(listener: (user: FirebaseUser | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentFirebaseUser);
    return () => this.listeners.delete(listener);
  }

  public getCurrentFirebaseUser(): FirebaseUser | null {
    return this.currentFirebaseUser;
  }

  /**
   * Synchronizes Firebase Google User with the Hospital Management User model
   */
  public syncFirebaseUserWithHospital(fbUser: FirebaseUser, preferredRole: UserRole = 'PACIENTE'): User {
    const existingUsers = storageService.getUsers();
    
    // Check if user exists by email or googleUid
    let hospitalUser = existingUsers.find(
      u => (fbUser.email && u.email.toLowerCase() === fbUser.email.toLowerCase()) || u.googleUid === fbUser.uid
    );

    const isMasterAdmin = fbUser.email?.toLowerCase() === 'seter7712@gmail.com';
    const effectiveRole = isMasterAdmin ? 'ADMINISTRADOR' : preferredRole;

    if (hospitalUser) {
      // Update with latest Google details
      hospitalUser = storageService.saveUser({
        ...hospitalUser,
        name: isMasterAdmin ? 'Seter (Administrador Principal)' : (hospitalUser.name || fbUser.displayName || 'Usuario Google'),
        role: isMasterAdmin ? 'ADMINISTRADOR' : hospitalUser.role,
        status: 'ACTIVO',
        photoURL: fbUser.photoURL || undefined,
        authProvider: 'google',
        googleUid: fbUser.uid
      });
    } else {
      // Create new user for this Google account
      hospitalUser = storageService.saveUser({
        name: isMasterAdmin ? 'Seter (Administrador Principal)' : (fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario Google'),
        email: fbUser.email || `google_${fbUser.uid}@hospital.com`,
        role: effectiveRole,
        dni: `G-${fbUser.uid.slice(0, 8).toUpperCase()}`,
        phone: fbUser.phoneNumber || '+54 11 9988-7712',
        status: 'ACTIVO',
        photoURL: fbUser.photoURL || undefined,
        authProvider: 'google',
        googleUid: fbUser.uid,
        insuranceName: effectiveRole === 'PACIENTE' ? 'Particular / Privado' : undefined
      });
    }

    storageService.setActiveUserId(hospitalUser.id);
    return hospitalUser;
  }

  /**
   * Login with real Google Account via Firebase Auth popup
   */
  public async loginWithGoogle(preferredRole: UserRole = 'PACIENTE'): Promise<GoogleAuthResult> {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = result.user;
      this.currentFirebaseUser = fbUser;

      const hospitalUser = this.syncFirebaseUserWithHospital(fbUser, preferredRole);

      storageService.addAuditLog({
        action: 'LOGIN',
        resourceType: 'SISTEMA',
        resourceId: `google-auth-${fbUser.uid}`,
        details: `Inicio de sesión exitoso con cuenta Google: ${fbUser.displayName || fbUser.email} (${hospitalUser.role})`
      });

      return {
        success: true,
        user: hospitalUser,
        firebaseUser: fbUser
      };
    } catch (error: any) {
      console.warn('Firebase Google Auth error:', error);
      const errorCode = error?.code || '';
      const isDomainError = errorCode === 'auth/unauthorized-domain';
      
      let errorMessage = 'No se pudo completar el inicio de sesión con Google.';
      if (isDomainError) {
        errorMessage = 'Dominio no autorizado en la consola de Firebase del proyecto ssss-42b23.';
      } else if (errorCode === 'auth/popup-blocked') {
        errorMessage = 'El navegador bloqueó la ventana emergente de Google. Permita popups para este sitio.';
      } else if (errorCode === 'auth/popup-closed-by-user') {
        errorMessage = 'Se cerró la ventana de autenticación de Google antes de finalizar.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        isDomainError
      };
    }
  }

  /**
   * Quick Google Account link for instant testing / domain fallback
   */
  public loginWithSimulatedGoogleAccount(email: string, displayName: string, role: UserRole = 'PACIENTE'): User {
    const existingUsers = storageService.getUsers();
    let hospitalUser = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    const isMasterAdmin = email.toLowerCase() === 'seter7712@gmail.com';
    const effectiveRole = isMasterAdmin ? 'ADMINISTRADOR' : role;
    const effectiveName = isMasterAdmin ? 'Seter (Administrador Principal)' : displayName;

    if (hospitalUser) {
      hospitalUser = storageService.saveUser({
        ...hospitalUser,
        name: effectiveName,
        role: effectiveRole,
        status: 'ACTIVO',
        authProvider: 'google',
        photoURL: hospitalUser.photoURL || 'https://lh3.googleusercontent.com/a/default-user'
      });
    } else {
      hospitalUser = storageService.saveUser({
        name: effectiveName,
        email,
        role: effectiveRole,
        dni: `G-${Math.floor(10000000 + Math.random() * 90000000)}`,
        phone: '+54 11 9988-7712',
        status: 'ACTIVO',
        photoURL: 'https://lh3.googleusercontent.com/a/default-user',
        authProvider: 'google',
        insuranceName: effectiveRole === 'PACIENTE' ? 'Particular / Privado' : undefined
      });
    }

    storageService.setActiveUserId(hospitalUser.id);
    storageService.addAuditLog({
      action: 'LOGIN',
      resourceType: 'SISTEMA',
      resourceId: `google-sim-${email}`,
      details: `Inicio de sesión autenticado con cuenta Google: ${email} [Rol: ${effectiveRole}]`
    });

    return hospitalUser;
  }

  /**
   * Sign out from Google Auth
   */
  public async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      this.currentFirebaseUser = null;
      this.notifyListeners();
    } catch (e) {
      console.warn('Logout error:', e);
    }
  }
}

export const authService = new AuthService();
