// Lightweight mock auth stored in localStorage (demo only, not secure).

const KEY = "poultryfit.auth.user";
const ACCOUNTS_KEY = "poultryfit.auth.accounts";
const PROFILE_KEY = "poultryfit.profile";

export interface AuthUser {
  email: string;
  name: string;
}
interface StoredAccount extends AuthUser {
  password: string;
}

export type HousingType = "backyard-open" | "deep-litter" | "cage" | "free-range";
export type Experience = "first-time" | "some" | "experienced";
export type BirdGoal = "eggs" | "meat" | "dual";
export type PoultryType = "chicken" | "duck" | "turkey" | "goose" | "quail" | "guinea-fowl";

export interface FarmerProfile {
  county: string;
  ward?: string;
  spaceM2: number;      // available floor space in m²
  budgetKes: number;    // startup budget in KES
  housing: HousingType;
  goal: BirdGoal;
  experience: Experience;
  poultryTypes: PoultryType[];
  createdAt: string;
}

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getCurrentUser(): AuthUser | null {
  return read<AuthUser | null>(KEY, null);
}
export function getProfile(): FarmerProfile | null {
  return read<FarmerProfile | null>(PROFILE_KEY, null);
}
export function saveProfile(p: FarmerProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("poultryfit-auth"));
}

export function signUp(name: string, email: string, password: string): AuthUser {
  email = email.trim().toLowerCase();
  if (!name.trim() || !email || password.length < 4) {
    throw new Error("Enter your name, a valid email and a password of 4+ characters.");
  }
  const accounts = read<StoredAccount[]>(ACCOUNTS_KEY, []);
  if (accounts.some((a) => a.email === email)) {
    throw new Error("An account with this email already exists. Try signing in.");
  }
  accounts.push({ name: name.trim(), email, password });
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  const user: AuthUser = { name: name.trim(), email };
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("poultryfit-auth"));
  return user;
}

export function signIn(email: string, password: string): AuthUser {
  email = email.trim().toLowerCase();
  const accounts = read<StoredAccount[]>(ACCOUNTS_KEY, []);
  const acc = accounts.find((a) => a.email === email && a.password === password);
  if (!acc) throw new Error("Invalid email or password.");
  const user: AuthUser = { name: acc.name, email: acc.email };
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("poultryfit-auth"));
  return user;
}

export function signOut() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("poultryfit-auth"));
}
