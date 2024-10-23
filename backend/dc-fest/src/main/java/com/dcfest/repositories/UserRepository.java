package com.dcfest.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dcfest.models.CollegeModel;
import com.dcfest.models.UserModel;

import jakarta.transaction.Transactional;

@Repository
public interface UserRepository extends JpaRepository<UserModel, Long> {

    Optional<UserModel> findByEmail(String email);

    Page<UserModel> findByType(Pageable pageable, String type);

    Page<UserModel> findByCollege(Pageable pageable, CollegeModel college);

    @Modifying
    @Transactional
    @Query("DELETE FROM UserModel u WHERE u.college.id = :collegeId")
    void deleteByCollegeId(@Param("collegeId") Long collegeId);

}
