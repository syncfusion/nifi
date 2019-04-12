
package org.apache.nifi.dbauth;

import java.sql.SQLException;
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
public class DbProvider implements LoginIdentityProvider {
    
    private static final Logger logger = LoggerFactory.getLogger(DbProvider.class);
    
    private String issuer;
    private long expiration;
    private SyncfusionAuthProvider provider;
    
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
        String dbType = configurationContext.getProperty("Database Type");
        final String dbUrl = configurationContext.getProperty("Database Url");
        String username = configurationContext.getProperty("Database Username");
        String password = configurationContext.getProperty("Database Password");
        
        if(dbType == null || dbType.isEmpty()) {
            dbType = DbTypes.Sqlite.toString();
            logger.info("As database type is not specified in configuration, sqlite database is choosen");
        }
        if(dbUrl == null || dbUrl.isEmpty()) {
            throw new ProviderCreationException("Database file path is not configured");
        }
        if(username.isEmpty() || password.isEmpty()) {
            username = null;
            password = null;
        }
        
        try {
            if(DbTypes.Sqlite.toString().equals(dbType.toLowerCase())) {
                provider = new SyncfusionAuthProvider(DbTypes.Sqlite, dbUrl, username, password);
            }
            else if(DbTypes.PostgreSQL.toString().equals(dbType.toLowerCase())) {
                provider = new SyncfusionAuthProvider(DbTypes.PostgreSQL, dbUrl, username, password);
            }
            else
                throw new ProviderCreationException(dbType + " database not supported in this version.");
        } catch (SQLException | ClassNotFoundException ex) {
            logger.error(ex.getMessage());
            if (logger.isDebugEnabled()) {
                logger.debug(StringUtils.EMPTY, ex);
            }
            throw new ProviderCreationException(ex.getMessage());
        }
    }
    
    @Override
    public AuthenticationResponse authenticate(LoginCredentials credentials) throws InvalidLoginCredentialsException, IdentityAccessException {
        if(provider == null)
            throw new IdentityAccessException("Db authentication provider is not initialized.");
        if(!provider.isAuthenticatedUser(credentials.getUsername(), credentials.getPassword()))
            throw new InvalidLoginCredentialsException("Invalid username or password");
        //provider.dispose();
        return new AuthenticationResponse(credentials.getUsername(), credentials.getUsername(), expiration, issuer);
    }
    
    @Override
    public void preDestruction() throws ProviderDestructionException {
    }
    
}
