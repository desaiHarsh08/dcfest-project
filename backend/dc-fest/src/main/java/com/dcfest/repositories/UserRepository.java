package com.dcfest.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dcfest.models.UserModel;

@Repository
public interface UserRepository extends JpaRepository<UserModel, Long> {

    // Explicit query to ensure archived users are never fetched during
    // authentication
    @Query("SELECT u FROM UserModel u WHERE u.email = :email AND u.isArchived = false")
    Optional<UserModel> findByEmailAndNotArchived(@Param("email") String email);

    // Keep original for backward compatibility (already filtered by
    // @SQLRestriction)
    Optional<UserModel> findByEmail(String email);

    Page<UserModel> findByType(Pageable pageable, String type);

}
