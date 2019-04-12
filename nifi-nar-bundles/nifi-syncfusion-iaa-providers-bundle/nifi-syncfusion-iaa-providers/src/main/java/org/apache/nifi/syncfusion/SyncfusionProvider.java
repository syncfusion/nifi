
package org.apache.nifi.syncfusion;

import java.io.IOException;
import java.util.concurrent.TimeUnit;
import org.apache.commons.lang3.StringUtils;
import org.apache.nifi.authentication.AuthenticationResponse;
import org.apache.nifi.authentication.LoginCredentials;
import org.apache.nifi.authentication.LoginIdentityProvider;
import org.apache.nifi.authentication.LoginIdentityProviderConfigurationContext;
import org.apache.nifi.authentication.LoginIdentityProviderInitializationContext;
import org.apache.nifi.authentication.exception.IdentityAccessException;
import org.apache.nifi.authentication.exception.InvalidLoginCredentialsException;
import org.apache.nifi.authentication.exception.ProviderCreationException;
import org.apache.nifi.authentication.exception.ProviderDestructionException;
import org.apache.nifi.util.FormatUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Abstract DB based implementation of a login identity provider.
 */
public class SyncfusionProvider implements LoginIdentityProvider {
    
    private static final Logger logger = LoggerFactory.getLogger(SyncfusionProvider.class);
    
    private String issuer;
    private long expiration;
    private String umpPropertyFile;
    
    private final String providerFileStr="providerFile";
    private final String codeStr = "code";
    
    @Override
    public void initialize(LoginIdentityProviderInitializationContext initializationContext) throws ProviderCreationException {
        this.issuer = getClass().getSimpleName();
    }
    
    @Override
    public void onConfigured(LoginIdentityProviderConfigurationContext configurationContext) throws ProviderCreationException {
        final String rawExpiration = configurationContext.getProperty("Authentication Expiration");
        if (StringUtils.isBlank(rawExpiration)) {
            throw new ProviderCreationException("The Authentication Expiration must be specified.");
        }
        try {
            expiration = FormatUtils.getTimeDuration(rawExpiration, TimeUnit.MILLISECONDS);
        } catch (final IllegalArgumentException iae) {
            throw new ProviderCreationException(String.format("The Expiration Duration '%s' is not a valid time duration", rawExpiration));
        }
        
        umpPropertyFile = configurationContext.getProperty("Provider File");
        
        if(umpPropertyFile == null || umpPropertyFile.isEmpty()) {
            throw new ProviderCreationException("Provider file path not configured");
        }
    }
    
    @Override
    public AuthenticationResponse authenticate(LoginCredentials credentials) throws InvalidLoginCredentialsException, IdentityAccessException {
        switch (credentials.getUsername()) {
            case providerFileStr:
                return new AuthenticationResponse(providerFileStr, umpPropertyFile, expiration, issuer);
            case codeStr:
                String username;
                try {
                    username = new JwtParsing().getUsername(credentials.getPassword());
                    if(StringUtils.isBlank(username))
                        throw new IllegalArgumentException("Empty login identity found");
                } catch (IllegalArgumentException | IOException ex) {
                    throw new InvalidLoginCredentialsException("Unable to parse response string " + ex);
                }
                return new AuthenticationResponse(username, username, expiration, issuer);
            default:
                throw new InvalidLoginCredentialsException("Unable to authentication from Syncfusion provider");
        }
    }
    
    @Override
    public void preDestruction() throws ProviderDestructionException {
    }
    
}
