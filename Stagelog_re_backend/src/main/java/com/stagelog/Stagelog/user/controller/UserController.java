package com.stagelog.Stagelog.user.controller;

import com.stagelog.Stagelog.global.security.CustomUserDetails;
import com.stagelog.Stagelog.user.dto.UserProfileResponse;
import com.stagelog.Stagelog.user.dto.UserUpdateRequest;
import com.stagelog.Stagelog.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long id = userDetails.getUser().getId();
        return ResponseEntity.ok(userService.getMyProfile(id));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UserUpdateRequest request) {
        Long id = userDetails.getUser().getId();
        return ResponseEntity.ok(userService.updateProfile(id, request));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long id = userDetails.getUser().getId();
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
