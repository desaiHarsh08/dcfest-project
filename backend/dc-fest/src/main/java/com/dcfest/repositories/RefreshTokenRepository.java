package com.dcfest.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dcfest.models.RefreshTokenModel;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenModel, Long> {

    Optional<RefreshTokenModel> findByEmail(String email);

    Optional<RefreshTokenModel> findByRefreshToken(String refreshToken);

}