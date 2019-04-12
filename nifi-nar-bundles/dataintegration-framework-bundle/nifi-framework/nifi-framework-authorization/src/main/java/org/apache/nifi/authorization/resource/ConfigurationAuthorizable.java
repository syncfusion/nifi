package org.apache.nifi.authorization.resource;

import org.apache.nifi.authorization.Resource;

public class ConfigurationAuthorizable implements Authorizable {
    @Override
    public Authorizable getParentAuthorizable() {
        return null;
    }

    @Override
    public Resource getResource() {
        return ResourceFactory.getConfigurationResource();
    }
}
