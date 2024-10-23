package com.dcfest.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.dcfest.services.RefreshTokenServices;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtTokenHelper jwtTokenHelper;

    @SuppressWarnings("unused")
    @Autowired
    private RefreshTokenServices refreshTokenServices;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException, java.io.IOException {

        String email = null, token = null;

        // Get the token from the request's header
        String bearerToken = request.getHeader("Authorization"); // "Bearer <token>"

        System.out.println("bearerToken: " + bearerToken);
        System.out.println("email/iccode: " + email);

        // Check if the token is correct
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            token = bearerToken.substring(7);
            try {
                email = this.jwtTokenHelper.getUsernameFromToken(token);
            } catch (IllegalArgumentException | MalformedJwtException illegalArgumentException) {
                System.err.println("Invalid token: " + illegalArgumentException.getMessage());
                throw new IllegalArgumentException("Invalid token");
            } catch (ExpiredJwtException expiredJwtException) {
                System.err.println("JWT expired: " + expiredJwtException.getMessage());
                throw new ExpiredJwtException(expiredJwtException.getHeader(), expiredJwtException.getClaims(),
                        "Bearer token got expired!");
            } catch (Exception e) {
                System.err.println("Authentication failed: " + e.getMessage());
                throw new SecurityException("Authentication failed... Please try to login again!");
            }
        } else {
            System.err.println("Bearer token is null or does not start with 'Bearer '");
        }

        // Validate the token
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);
            if (this.jwtTokenHelper.validateToken(token, userDetails)) {
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                // System.out.println("Token validated, setting authentication context");
            } else {
                // System.out.println(email + " " + bearerToken);
                // System.err.println("Invalid token");
                throw new SecurityException("Authentication failed... Please try to login again!");
            }
        }

        // Forward the request further
        filterChain.doFilter(request, response);
    }

}