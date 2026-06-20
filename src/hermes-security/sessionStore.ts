export type HermesProfile = {
  sub?: string;
  user_id?: string;
  preferred_username?: string;
  email?: string;
  tenant_id?: string;
  tenant_slug?: string;
  tenant_name?: string;
  roles?: string[];
  permissions?: string[];
};

export type HermesSession = {
  profile?: HermesProfile;
};

export function clearSession() {
  sessionStorage.clear();
}
