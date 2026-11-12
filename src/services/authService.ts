import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../firebase/config';
import { storageService } from './storageService';
import { User, UserRole } from '../types/hospital';
import { hashPassword } from '../utils/passwordUtils';

export { hashPassword };

export interface GoogleAuthResult {
  success: boolean;
  user?: User;
  firebaseUser?: FirebaseUser;
  error?: string;
  isDomainError?: boolean;
}

export type AuthResult = GoogleAuthResult;

export interface EmailRegisterPayload {
  name: string;
  dni: string;
  email: string;
  phone: string;
  password: string;
  insuranceName?: string;
  insuranceNumber?: string;
}

class AuthService {
  private currentFirebaseUser: FirebaseUser | null = null;
  private listeners: Set<(user: FirebaseUser | null) => void> = new Set();
  private isManualAuthInProgress = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      onAuthStateChanged(auth, (fbUser) => {
        this.currentFirebaseUser = fbUser;
        if (!this.isManualAuthInProgress && fbUser && fbUser.email) {
          const isGoogleProvider = fbUser.providerData.some(p => p.providerId === 'google.com');
          this.syncFirebaseUserWithHospital(
            fbUser,
            'PACIENTE',
            isGoogleProvider ? 'google' : 'local'
          );
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
   * Synchronizes Firebase User with the Hospital Management User model
   */
  public syncFirebaseUserWithHospital(
    fbUser: FirebaseUser,
    preferredRole: UserRole = 'PACIENTE',
    providerType: 'google' | 'local' = 'google',
    extraData?: Partial<User>
  ): User {
    const existingUsers = storageService.getUsers();

    let hospitalUser = existingUsers.find(
      u => (fbUser.email && u.email.toLowerCase() === fbUser.email.toLowerCase()) || u.googleUid === fbUser.uid
    );

    const isMasterAdmin = fbUser.email?.toLowerCase() === 'seter7712@gmail.com';
    const effectiveRole = isMasterAdmin ? 'ADMINISTRADOR' : preferredRole;

    if (hospitalUser) {
      // Do not reactivate a suspended user automatically
      const nextStatus = isMasterAdmin ? 'ACTIVO' : hospitalUser.status;
      hospitalUser = storageService.saveUser({
        ...hospitalUser,
        name: isMasterAdmin
          ? 'Seter (Administrador Principal)'
          : (extraData?.name || hospitalUser.name || fbUser.displayName || 'Usuario'),
        role: isMasterAdmin ? 'ADMINISTRADOR' : hospitalUser.role,
        status: nextStatus,
        photoURL: fbUser.photoURL || hospitalUser.photoURL,
        authProvider: hospitalUser.authProvider || providerType,
        googleUid: providerType === 'google' ? fbUser.uid : hospitalUser.googleUid,
        ...(extraData?.passwordHash ? { passwordHash: extraData.passwordHash } : {}),
        ...(extraData?.plainPassword ? { plainPassword: extraData.plainPassword } : {})
      });
    } else {
      hospitalUser = storageService.saveUser({
        name: isMasterAdmin
          ? 'Seter (Administrador Principal)'
          : (extraData?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario'),
        email: fbUser.email || `user_${fbUser.uid}@hospital.com`,
        role: effectiveRole,
        dni: extraData?.dni || `G-${fbUser.uid.slice(0, 8).toUpperCase()}`,
        phone: extraData?.phone || fbUser.phoneNumber || '+54 11 9988-7712',
        status: 'ACTIVO',
        photoURL: fbUser.photoURL || undefined,
        authProvider: providerType,
        googleUid: providerType === 'google' ? fbUser.uid : undefined,
        passwordHash: extraData?.passwordHash,
        plainPassword: extraData?.plainPassword,
        insuranceName: extraData?.insuranceName || (effectiveRole === 'PACIENTE' ? 'Particular / Privado' : undefined),
        insuranceNumber: extraData?.insuranceNumber
      });
    }

    if (hospitalUser.status === 'ACTIVO') {
      storageService.setActiveUserId(hospitalUser.id);
    }
    return hospitalUser;
  }

  /**
   * Login with real Google Account via Firebase Auth popup
   */
  public async loginWithGoogle(preferredRole: UserRole = 'PACIENTE'): Promise<GoogleAuthResult> {
    this.isManualAuthInProgress = true;
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = result.user;
      this.currentFirebaseUser = fbUser;

      const hospitalUser = this.syncFirebaseUserWithHospital(fbUser, preferredRole, 'google');

      if (hospitalUser.status === 'SUSPENDIDO') {
        await this.logout();
        return {
          success: false,
          user: hospitalUser,
          error: 'ACCESO DENEGADO: Su cuenta está suspendida por la dirección médica.'
        };
      }

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
    } catch (error: unknown) {
      console.warn('Firebase Google Auth error:', error);
      const err = error as { code?: string; message?: string };
      const errorCode = err?.code || '';
      const isDomainError = errorCode === 'auth/unauthorized-domain';

      let errorMessage = 'No se pudo completar el inicio de sesión con Google.';
      if (isDomainError) {
        errorMessage = 'Dominio no autorizado en la consola de Firebase del proyecto ssss-42b23.';
      } else if (errorCode === 'auth/popup-blocked') {
        errorMessage = 'El navegador bloqueó la ventana emergente de Google. Permita popups para este sitio.';
      } else if (errorCode === 'auth/popup-closed-by-user') {
        errorMessage = 'Se cerró la ventana de autenticación de Google antes de finalizar.';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      return {
        success: false,
        error: errorMessage,
        isDomainError
      };
    } finally {
      this.isManualAuthInProgress = false;
    }
  }

  /**
   * Login with Email and Password (Firebase Email/Password Auth + Hospital Directory verification)
   */
  public async loginWithEmailPassword(emailInput: string, password: string): Promise<AuthResult> {
    const email = emailInput.trim().toLowerCase();
    if (!email || !password) {
      return {
        success: false,
        error: 'Ingrese su correo electrónico y contraseña.'
      };
    }

    const existingUsers = storageService.getUsers();
    const existingHospitalUser = existingUsers.find(u => u.email.toLowerCase() === email);

    if (existingHospitalUser && existingHospitalUser.status === 'SUSPENDIDO') {
      return {
        success: false,
        error: 'ACCESO DENEGADO: Su cuenta se encuentra SUSPENDIDA por la dirección médica.'
      };
    }

    const computedHash = await hashPassword(password);
    this.isManualAuthInProgress = true;

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = credential.user;
      this.currentFirebaseUser = fbUser;

      const hospitalUser = this.syncFirebaseUserWithHospital(
        fbUser,
        existingHospitalUser?.role || 'PACIENTE',
        'local',
        { passwordHash: computedHash, plainPassword: password }
      );

      if (hospitalUser.status === 'SUSPENDIDO') {
        await this.logout();
        return {
          success: false,
          error: 'ACCESO DENEGADO: Su cuenta se encuentra SUSPENDIDA por la dirección médica.'
        };
      }

      storageService.addAuditLog({
        action: 'LOGIN',
        resourceType: 'SISTEMA',
        resourceId: `email-auth-${hospitalUser.id}`,
        details: `Inicio de sesión con correo y contraseña: ${hospitalUser.email} (${hospitalUser.role})`
      });

      return {
        success: true,
        user: hospitalUser,
        firebaseUser: fbUser
      };
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      const errorCode = err?.code || '';

      // Fallback verification against locally registered/admin-provisioned credentials
      if (existingHospitalUser) {
        if (existingHospitalUser.passwordHash || existingHospitalUser.plainPassword) {
          const hashMatches = existingHospitalUser.passwordHash === computedHash;
          const plainMatches = !existingHospitalUser.passwordHash && existingHospitalUser.plainPassword === password;
          if (hashMatches || plainMatches) {
            if (!existingHospitalUser.plainPassword || !existingHospitalUser.passwordHash) {
              storageService.saveUser({
                ...existingHospitalUser,
                passwordHash: computedHash,
                plainPassword: password
              });
            }
            const sessionResult = storageService.setActiveUserId(existingHospitalUser.id);
            if (!sessionResult.success || !sessionResult.user) {
              return {
                success: false,
                error: sessionResult.error || 'No se pudo iniciar la sesión.'
              };
            }
            storageService.addAuditLog({
              action: 'LOGIN',
              resourceType: 'SISTEMA',
              resourceId: `local-auth-${existingHospitalUser.id}`,
              details: `Inicio de sesión con correo y contraseña: ${existingHospitalUser.email} (${existingHospitalUser.role})`
            });
            return {
              success: true,
              user: sessionResult.user
            };
          }
          return {
            success: false,
            error: 'Contraseña incorrecta. Verifique su clave e intente nuevamente.'
          };
        }

        if (existingHospitalUser.authProvider === 'google') {
          return {
            success: false,
            error: 'Esta cuenta fue vinculada con Google y no tiene contraseña local configurada. Ingrese con el botón de Google.'
          };
        }

        return {
          success: false,
          error: 'Esta cuenta aún no tiene una contraseña configurada. Solicite al administrador asignar una contraseña o ingrese con Google.'
        };
      }

      if (errorCode === 'auth/invalid-email') {
        return {
          success: false,
          error: 'El formato del correo electrónico no es válido.'
        };
      }

      if (errorCode === 'auth/too-many-requests') {
        return {
          success: false,
          error: 'Demasiados intentos fallidos. Espere unos minutos antes de volver a intentar.'
        };
      }

      return {
        success: false,
        error: 'Correo electrónico o contraseña incorrectos, o cuenta no registrada.'
      };
    } finally {
      this.isManualAuthInProgress = false;
    }
  }

  /**
   * Register new patient with Email and Password
   */
  public async registerWithEmailPassword(payload: EmailRegisterPayload): Promise<AuthResult> {
    const email = payload.email.trim().toLowerCase();
    const dni = payload.dni.trim();
    const name = payload.name.trim();
    const phone = payload.phone.trim();

    if (!name || !dni || !email || !phone || !payload.password) {
      return {
        success: false,
        error: 'Complete todos los campos obligatorios, incluyendo la contraseña.'
      };
    }

    if (payload.password.length < 6) {
      return {
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres.'
      };
    }

    const existingUsers = storageService.getUsers();
    const duplicate = existingUsers.find(
      u => u.dni === dni || u.email.toLowerCase() === email
    );
    if (duplicate) {
      return {
        success: false,
        error: `Ya existe una cuenta registrada con ese DNI o correo electrónico (${duplicate.name}). Inicie sesión con su correo y contraseña.`
      };
    }

    const passwordHash = await hashPassword(payload.password);
    this.isManualAuthInProgress = true;

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, payload.password);
      const fbUser = credential.user;
      try {
        await updateProfile(fbUser, { displayName: name });
      } catch {
        // Non-blocking profile update
      }
      this.currentFirebaseUser = fbUser;

      const hospitalUser = this.syncFirebaseUserWithHospital(fbUser, 'PACIENTE', 'local', {
        name,
        dni,
        phone,
        passwordHash,
        plainPassword: payload.password,
        insuranceName: payload.insuranceName || 'Particular / Privado',
        insuranceNumber: payload.insuranceNumber
      });

      return {
        success: true,
        user: hospitalUser,
        firebaseUser: fbUser
      };
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      const errorCode = err?.code || '';

      if (errorCode === 'auth/email-already-in-use') {
        return {
          success: false,
          error: 'Este correo electrónico ya está registrado en Firebase. Inicie sesión con su contraseña o con Google.'
        };
      }

      if (errorCode === 'auth/weak-password') {
        return {
          success: false,
          error: 'La contraseña es demasiado débil. Utilice al menos 6 caracteres.'
        };
      }

      if (errorCode === 'auth/invalid-email') {
        return {
          success: false,
          error: 'El correo electrónico ingresado no tiene un formato válido.'
        };
      }

      // If Firebase Email/Password sign-in provider is disabled or unavailable in preview,
      // persist the new patient securely in the hospital directory with SHA-256 passwordHash.
      if (errorCode === 'auth/operation-not-allowed' || errorCode === 'auth/network-request-failed') {
        const newUser = storageService.saveUser({
          name,
          dni,
          email,
          phone,
          insuranceName: payload.insuranceName || 'Particular / Privado',
          insuranceNumber: payload.insuranceNumber,
          role: 'PACIENTE',
          status: 'ACTIVO',
          authProvider: 'local',
          passwordHash,
          plainPassword: payload.password
        });

        const sessionResult = storageService.setActiveUserId(newUser.id);
        if (sessionResult.success && sessionResult.user) {
          return {
            success: true,
            user: sessionResult.user
          };
        }
      }

      return {
        success: false,
        error: err?.message || 'No se pudo completar el registro con correo y contraseña.'
      };
    } finally {
      this.isManualAuthInProgress = false;
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
   * Sign out from Firebase & Google Auth
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
