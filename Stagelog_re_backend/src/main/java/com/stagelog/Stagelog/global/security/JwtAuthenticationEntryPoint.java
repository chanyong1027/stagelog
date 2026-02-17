package com.stagelog.Stagelog.global.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stagelog.Stagelog.global.exception.ErrorResponse;
import com.stagelog.Stagelog.global.jwt.JwtAuthenticationFilter;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final String INVALID_TOKEN_MESSAGE = "유효하지 않은 Access Token입니다.";
    private static final String EXPIRED_TOKEN_MESSAGE = "만료된 Access Token입니다.";

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {
        String tokenErrorCode = (String) request.getAttribute(JwtAuthenticationFilter.TOKEN_ERROR_CODE_ATTRIBUTE);

        if (JwtAuthenticationFilter.TOKEN_EXPIRED_CODE.equals(tokenErrorCode)) {
            writeUnauthorizedResponse(response, JwtAuthenticationFilter.TOKEN_EXPIRED_CODE, EXPIRED_TOKEN_MESSAGE);
            return;
        }

        writeUnauthorizedResponse(response, JwtAuthenticationFilter.TOKEN_INVALID_CODE, INVALID_TOKEN_MESSAGE);
    }

    private void writeUnauthorizedResponse(HttpServletResponse response, String code, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
                objectMapper.writeValueAsString(ErrorResponse.of(HttpStatus.UNAUTHORIZED, code, message))
        );
    }
}
