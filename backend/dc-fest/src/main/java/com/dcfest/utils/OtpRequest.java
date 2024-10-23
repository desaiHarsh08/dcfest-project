package com.dcfest.utils;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OtpRequest {

    private Long otp;

    private String email;

    private String phone;

}
