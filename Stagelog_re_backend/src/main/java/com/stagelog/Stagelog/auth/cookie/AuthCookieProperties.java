package com.stagelog.Stagelog.auth.cookie;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.auth.cookie")
public class AuthCookieProperties {
    private Boolean secure;
    private String sameSite;
    private String domain;
}
