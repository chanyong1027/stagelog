package com.stagelog.Stagelog.auth.oauth2.service;

import com.stagelog.Stagelog.user.domain.User;
import java.util.Collection;
import java.util.Map;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

/**
 * Spring Security OAuth2User를 구현하며 내부 User 엔티티를 함께 보유한다.
 * OAuth2SuccessHandler에서 캐스팅하여 User 엔티티에 접근한다.
 */
public class CustomOAuth2User implements OAuth2User {

    private final User user;
    private final Map<String, Object> attributes;
    private final Collection<? extends GrantedAuthority> authorities;
    private final String nameAttributeKey;

    public CustomOAuth2User(
            User user,
            Map<String, Object> attributes,
            Collection<? extends GrantedAuthority> authorities,
            String nameAttributeKey) {
        this.user = user;
        this.attributes = attributes;
        this.authorities = authorities;
        this.nameAttributeKey = nameAttributeKey;
    }

    public User getUser() {
        return user;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getName() {
        return String.valueOf(attributes.get(nameAttributeKey));
    }
}
