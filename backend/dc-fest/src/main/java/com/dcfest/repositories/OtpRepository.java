package com.dcfest.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dcfest.models.OtpModel;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpModel, Long> {

    Optional<OtpModel> findByEmailAndOtp(String email, Long otp);

    Optional<OtpModel> findByPhoneAndOtp(String phone, Long otp);

}
