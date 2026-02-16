package com.stagelog.Stagelog.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class SignupRequest {

    @NotBlank(message = "유저명은 필수입니다.")
    @Size(min = 2, max = 20, message = "유저명은 2자 이상 20자 이하로 설정해주세요.")
    @Pattern(
            regexp = "^[a-zA-Z0-9_]+$",
            message = "유저명은 영문, 숫자, 언더스코어만 사용 가능합니다."
    )
    private String userId;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,20}$",
            message = "비밀번호는 8-20자의 영문, 숫자, 특수문자를 포함해야 합니다."
    )
    private String password;

    @NotBlank(message = "닉네임은 필수입니다.")
    @Size(min = 2, max = 20, message = "닉네임은 2자 이상 20자 이하로 설정해주세요.")
    @Pattern(
            regexp = "^[가-힣a-zA-Z0-9_]+$",
            message = "닉네임은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다."
    )
    private String nickname;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;
}
