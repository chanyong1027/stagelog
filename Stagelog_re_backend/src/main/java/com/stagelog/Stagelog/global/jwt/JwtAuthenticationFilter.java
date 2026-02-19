package com.stagelog.Stagelog.global.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stagelog.Stagelog.global.exception.ErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    public static final String TOKEN_ERROR_CODE_ATTRIBUTE = "jwtTokenErrorCode";
    public static final String TOKEN_EXPIRED_CODE = "TOKEN_EXPIRED";
    public static final String TOKEN_INVALID_CODE = "TOKEN_INVALID";

    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper;

    /**
     * OAuth2 진입/콜백 경로와 /error 경로는 JWT 필터를 명시적으로 건너뛴다.
     * "토큰이 null이면 통과"하는 암묵 동작에 의존하지 않고 명시 규칙으로 고정한다.
     * /error 포함 이유: OAuth2 실패 핸들러 → Spring /error forward 시 이중 처리 방지
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/oauth2/")
                || path.startsWith("/login/oauth2/")
                || path.equals("/error");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = jwtTokenProvider.resolveToken(request);

        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        JwtTokenProvider.TokenValidationResult tokenValidationResult = jwtTokenProvider.getTokenValidationResult(token);
        if (tokenValidationResult != JwtTokenProvider.TokenValidationResult.VALID) {
            request.setAttribute(
                    TOKEN_ERROR_CODE_ATTRIBUTE,
                    tokenValidationResult == JwtTokenProvider.TokenValidationResult.EXPIRED
                            ? TOKEN_EXPIRED_CODE
                            : TOKEN_INVALID_CODE
            );
            filterChain.doFilter(request, response);
            return;
        }

        if (!jwtTokenProvider.isAccessToken(token)) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Access Token이 아닙니다.");
            return;
        }

        Authentication authentication = jwtTokenProvider.getAuthentication(token);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        if (!userDetails.isEnabled()) {
            sendErrorResponse(response, HttpStatus.FORBIDDEN, "탈퇴한 사용자입니다.");
            return;
        }
        if (!userDetails.isAccountNonLocked()) {
            sendErrorResponse(response, HttpStatus.FORBIDDEN, "정지된 사용자입니다.");
            return;
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message)
            throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ErrorResponse errorResponse = ErrorResponse.of(status, "AUTH_FORBIDDEN", message);
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
