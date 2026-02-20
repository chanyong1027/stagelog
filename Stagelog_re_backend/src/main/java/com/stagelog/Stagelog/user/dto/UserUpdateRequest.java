package com.stagelog.Stagelog.user.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class UserUpdateRequest {

    @Size(min = 2, max = 20, message = "닉네임은 2자 이상 20자 이하로 설정해주세요.")
    @Pattern(
            regexp = "^[가-힣a-zA-Z0-9_]+$",
            message = "닉네임은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다."
    )
    private String nickname;

    private String profileImageUrl;

    private Boolean emailNotificationEnabled;
}
