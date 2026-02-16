package com.stagelog.Stagelog.auth.dto;

import com.stagelog.Stagelog.user.domain.Provider;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@AllArgsConstructor
public class OAuth2LoginRequest {

    @NotNull(message = "소셜 로그인 제공자는 필수입니다.")
    private Provider provider;

    @NotBlank(message = "소셜 ID는 필수입니다.")
    private String providerId;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "닉네임은 필수입니다.")
    private String nickname;

    private String profileImageUrl;
}
