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
import org.apache.log4j.Logger;
import org.labkey.api.data.PropertyManager;
import org.labkey.wnprc_ehr.WNPRC_EHRController;

import java.net.MalformedURLException;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

public class AzureActiveDirectoryAuthenticator {

	private static Logger _log = Logger.getLogger(WNPRC_EHRController.class);
    private String applicationId;
    private String upn;
    private String authority;
    private Set<String> scopes;
    private String name;


    public AzureActiveDirectoryAuthenticator(String applicationId, String authority, String upn, String name, Set<String> scopes) {
        this.applicationId = applicationId;
        this.authority = authority;
        this.upn = upn;
        this.name = name;
        this.scopes = scopes;
    }

    public String getUserAccessToken() {
        if (applicationId == null) {
            System.out.println("You must initialize Authentication before calling getUserAccessToken");
			return null;
		}

		PropertyManager.PropertyMap properties = PropertyManager.getEncryptedStore().getWritableProperties(name + ".Credentials", true);
        String tokenCache = properties.get("TokenCache");
        ITokenCacheAccessAspect persistenceAspect = new TokenPersistence(tokenCache);
        IAuthenticationResult result = null;
        PublicClientApplication app;
		ExecutorService pool = Executors.newFixedThreadPool(1);

        if (tokenCache != null) {
			try {
				// Build the MSAL application object with
				// app ID and authority
				app = PublicClientApplication
						.builder(applicationId)
						.authority(authority)
						.executorService(pool)
						.setTokenCacheAccessAspect(persistenceAspect)
						.build();
			}
			catch (MalformedURLException e) {
				return null;
			}
		} else {
        	try {
				// Build the MSAL application object with
				// app ID and authority
				app = PublicClientApplication
						.builder(applicationId)
						.authority(authority)
						.executorService(pool)
						.build();
			}
			catch (MalformedURLException e) {
				return null;
			}
		}

		// Create consumer to receive the DeviceCode object
		// This method gets executed during the flow and provides
		// the URL the user logs into and the device code to enter
		Consumer<DeviceCode> deviceCodeConsumer = (DeviceCode deviceCode) -> {
			// Print the login information to the console
			_log.warn(deviceCode.message());
			System.out.println(deviceCode.message());
		};

		Set<IAccount> accounts = app.getAccounts().join();
		IAccount myAccount = null;

		for (IAccount account : accounts) {
			if (upn.equals(account.username())) {
				myAccount = account;
				break;
			}
		}

		// Request a token, passing the requested permission scopes
		try {
			if (myAccount != null) {
				result = app.acquireTokenSilently(
						SilentParameters
							.builder(scopes, myAccount)
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

		properties.put("TokenCache", app.tokenCache().serialize());
		properties.save();

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
