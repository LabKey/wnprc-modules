package org.labkey.googledrive.api;

/**
 * Created by jon on 1/13/17.
 */
public class ServiceAccountForm {
    public String projectId;
    public String privateKeyId;
    public String privateKey;
    public String clientEmail;
    public String clientId;
    public String authUri;
    public String tokenUri;
    public String clientX509CertUrl;
    public String authProviderX509CertUrl;

    public String getProjectId() { return projectId;}
    public String getPrivateKeyId() { return privateKeyId;}
    public String getPrivateKey() { return privateKey;}
    public String getClientEmail() { return clientEmail;}
    public String getClientId() { return clientId;}
    public String getAuthUri() { return authUri;}
    public String getTokenUri() { return tokenUri;}
    public String getClientX509CertUrl() { return clientX509CertUrl;}
    public String getAuthProviderX509CertUrl() { return authProviderX509CertUrl;}

    public void setProjectId(String projectId) {this.projectId = projectId; }
    public void setPrivateKeyId(String privateKeyId) {this.privateKeyId = privateKeyId; }
    public void setPrivateKey(String privateKey) {this.privateKey = privateKey; }
    public void setClientEmail(String clientEmail) {this.clientEmail = clientEmail; }
    public void setClientId(String clientId) {this.clientId = clientId; }
    public void setAuthUri(String authUri) {this.authUri = authUri; }
    public void setTokenUri(String tokenUri) {this.tokenUri = tokenUri; }
    public void setClientX509CertUrl(String clientX509CertUrl) {this.clientX509CertUrl = clientX509CertUrl; }
    public void setAuthProviderX509CertUrl(String authProviderX509CertUrl) {this.authProviderX509CertUrl = authProviderX509CertUrl; }
}
