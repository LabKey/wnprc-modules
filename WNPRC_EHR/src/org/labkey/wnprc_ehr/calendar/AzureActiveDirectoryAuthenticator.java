package org.labkey.wnprc_ehr.calendar;

import com.microsoft.aad.msal4j.DeviceCode;
import com.microsoft.aad.msal4j.DeviceCodeFlowParameters;
import com.microsoft.aad.msal4j.IAccount;
import com.microsoft.aad.msal4j.IAuthenticationResult;
import com.microsoft.aad.msal4j.ITokenCacheAccessAspect;
import com.microsoft.aad.msal4j.ITokenCacheAccessContext;
import com.microsoft.aad.msal4j.MsalException;
import com.microsoft.aad.msal4j.PublicClientApplication;
import com.microsoft.aad.msal4j.SilentParameters;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

public abstract class AzureActiveDirectoryAuthenticator {

    private String applicationId;
    private String upn;
    private String authority;
    private Set scopes;

    public AzureActiveDirectoryAuthenticator(String applicationId, String authority, String upn, Set scopes) {
        this.applicationId = applicationId;
        this.authority = authority;
        this.upn = upn;
        this.scopes = scopes;
    }

    public String getUserAccessToken() {
        if (applicationId == null) {
            System.out.println("You must initialize Authentication before calling getUserAccessToken");
			return null;
		}

		String dataToInitCache = "";
		try {
			dataToInitCache = Files.readString(Path.of("cache.json"), StandardCharsets.US_ASCII);
		} catch (IOException e) {
			System.err.println("Error reading from cache.");
		}

		ITokenCacheAccessAspect persistenceAspect = new TokenPersistence(dataToInitCache);

		ExecutorService pool = Executors.newFixedThreadPool(1);
		PublicClientApplication app;
		try {
			// Build the MSAL application object with
			// app ID and authority
			app = PublicClientApplication
                    .builder(applicationId)
					.authority(authority)
					.executorService(pool)
					.setTokenCacheAccessAspect(persistenceAspect)
					.build();
		} catch (MalformedURLException e) {
			return null;
		}

		// Create consumer to receive the DeviceCode object
		// This method gets executed during the flow and provides
		// the URL the user logs into and the device code to enter
		Consumer<DeviceCode> deviceCodeConsumer = (DeviceCode deviceCode) -> {
			// Print the login information to the console
			System.out.println(deviceCode.message());
		};

		Set<IAccount> accounts = app.getAccounts().join();
		IAccount cachedAccount = null;

		for (IAccount account : accounts) {
			if (upn.equals(account.username())) {
				cachedAccount = account;
			}
		}

		// Request a token, passing the requested permission scopes
		IAuthenticationResult result = null;
		try {
			if (cachedAccount != null) {
				result = app.acquireTokenSilently(
						SilentParameters
							.builder(scopes, cachedAccount)
							.build()
						).join();
			} else {
				result = app.acquireTokenSilently(
						SilentParameters
							.builder(scopes)
							.build()
						).join();
			}
		} catch (Exception e) {
			if (e.getCause() instanceof MsalException) {
				result = app.acquireToken(
						DeviceCodeFlowParameters
							.builder(scopes, deviceCodeConsumer)
							.build()
						).exceptionally(ex -> {
							System.out.println("Unable to authenticate - " + ex.getMessage());
							return null;
						}).join();
			}
		}

		String serializedCache = app.tokenCache().serialize();

		try {
			Files.write(Path.of("cache.json"), serializedCache.getBytes(StandardCharsets.UTF_8));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		pool.shutdown();

		if (result != null) {
			return result.accessToken();
		}

		return null;
	}

	static class TokenPersistence implements ITokenCacheAccessAspect{
		String data;

		public TokenPersistence(String data) {
			this.data = data;
		}

		@Override
		public void beforeCacheAccess(ITokenCacheAccessContext iTokenCacheAccessContext) {
			iTokenCacheAccessContext.tokenCache().deserialize(data);
		}

		@Override
		public void afterCacheAccess(ITokenCacheAccessContext iTokenCacheAccessContext) {
			data = iTokenCacheAccessContext.tokenCache().serialize();
		}
	}
}
