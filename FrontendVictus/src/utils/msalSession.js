const SESSION_STORAGE_KEY = "victus-auth-session";

function storeSession(tokenResponse) {
  if (!tokenResponse) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  const { accessToken, expiresOn, account } = tokenResponse;
  const payload = {
    token: accessToken,
    expiresOn: expiresOn ? new Date(expiresOn).toISOString() : null,
    account: account
      ? {
          homeAccountId: account.homeAccountId,
          username: account.username,
          name: account.name,
        }
      : null,
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
}

function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export { SESSION_STORAGE_KEY, storeSession, clearSession };
