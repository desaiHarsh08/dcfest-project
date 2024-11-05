package com.dcfest.controllers;

import com.dcfest.notifications.whatsapp.WhatsAppService;
import jakarta.servlet.http.Cookie;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dcfest.dtos.UserDto;
import com.dcfest.exceptions.ResourceNotFoundException;
import com.dcfest.models.CollegeModel;
import com.dcfest.models.OtpModel;
import com.dcfest.models.RefreshTokenModel;
import com.dcfest.models.UserModel;
import com.dcfest.notifications.email.EmailServices;
import com.dcfest.repositories.CollegeRepository;
import com.dcfest.repositories.OtpRepository;
import com.dcfest.repositories.UserRepository;
import com.dcfest.security.JwtTokenHelper;
import com.dcfest.services.CollegeServices;
import com.dcfest.services.RefreshTokenServices;
import com.dcfest.services.UserServices;
import com.dcfest.utils.AuthRequest;
import com.dcfest.utils.AuthResponse;
import com.dcfest.utils.OtpRequest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private WhatsAppService whatsAppService;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private UserServices userServices;

    @Autowired
    private EmailServices emailServices;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private CollegeServices collegeServices;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtTokenHelper jwtTokenHelper;

    @Autowired
    private RefreshTokenServices refreshTokenServices;

    @Autowired
    private CollegeRepository collegeRepository;

    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        UserDto createdUser = userServices.creatUser(userDto);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> doLogin(@RequestBody AuthRequest authRequest, HttpServletResponse response) {
        if (authRequest.getUsername().isEmpty() || authRequest.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Please provide the valid credentials!");
        }

        System.out.println(authRequest);

        this.authenticateUser(authRequest.getUsername(), authRequest.getPassword());

        UserDetails userDetails = this.userDetailsService.loadUserByUsername(authRequest.getUsername());

        CollegeModel collegeModel = new CollegeModel();
        UserModel userModel = this.userRepository.findByEmail(authRequest.getUsername()).orElse(null);
        if (userModel == null) {
            collegeModel = this.collegeRepository.findByEmail(authRequest.getUsername()).orElse(null);
            if (collegeModel == null) {
                collegeModel = this.collegeRepository.findByIcCode(authRequest.getUsername()).orElse(null);
                if (collegeModel == null) {
                    throw new ResourceNotFoundException("No user exsit for username:" + authRequest.getUsername());
                }
                if (collegeModel.getEmail() != null) {
                    userModel = this.userRepository.findByEmail(collegeModel.getEmail()).orElse(null);
                }
            }
        }



        String accessToken = this.jwtTokenHelper.generateToken(userDetails);
        String refreshToken = this.refreshTokenServices.createRefreshToken(authRequest.getUsername()).getRefreshToken();
        System.out.println("refreshToken: " + refreshToken);

        Cookie emailCookie = new Cookie("email", authRequest.getUsername());
        emailCookie.setHttpOnly(true);
        emailCookie.setPath("/");
        emailCookie.setMaxAge(30 * 24 * 60 * 60); // 30 days expiration

        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(30 * 24 * 60 * 60); // 30 days expiration

        // Add cookies to the response
        response.addCookie(emailCookie);
        response.addCookie(refreshTokenCookie);

        response.addCookie(emailCookie);
        response.addCookie(refreshTokenCookie);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setAccessToken(accessToken);
        if (userModel != null) {
            UserDto userDto = this.modelMapper.map(userModel, UserDto.class);
            if (userModel.getCollege() != null) {
                userDto.setCollegeId(userModel.getCollege().getId());
            }
            authResponse.setUser(userDto);
        } else {
            authResponse.setUser(this.collegeServices.getCollegeByIcCode(collegeModel.getIcCode()));
        }

        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }

    private void authenticateUser(String username, String password) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username,
                password);
        this.authenticationManager.authenticate(authenticationToken);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        // Fetch the `email` and `refreshToken` from the cookies
        String email = null;
        String refreshToken = null;

        Cookie[] cookies = request.getCookies();
        System.out.println("cookies: " + cookies);
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                System.out.println(cookie);
                if (cookie.getName().equals("email")) {
                    email = cookie.getValue();
                } else if (cookie.getName().equals("refreshToken")) {
                    refreshToken = cookie.getValue();
                }
            }
        }

        if (email == null || refreshToken == null) {
            throw new SecurityException("Security Exception... Please try to login again!");
        }

        // Verify the refresh token
        RefreshTokenModel refreshTokenModel = this.refreshTokenServices.verifyRefreshToken(refreshToken);

        if (!refreshTokenModel.getEmail().equals(email)) {
            throw new SecurityException("Security Exception... Please try to login again!");
        }

        // Generate new access token
        UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);
        String accessToken = this.jwtTokenHelper.generateToken(userDetails);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setAccessToken(accessToken);

        CollegeModel collegeModel = new CollegeModel();
        UserModel userModel = this.userRepository.findByEmail(email).orElse(null);
        if (userModel == null) {
            collegeModel = this.collegeRepository.findByEmail(email).orElse(null);
            if (collegeModel == null) {
                String tmp = email;
                collegeModel = this.collegeRepository.findByIcCode(email).orElseThrow(
                        () -> new ResourceNotFoundException("No user exsit for username:" + tmp));
            }
        }

        if (userModel != null) {
            UserDto userDto = this.modelMapper.map(userModel, UserDto.class);
            if (userModel.getCollege() != null) {
                userDto.setCollegeId(userModel.getCollege().getId());
            }
            authResponse.setUser(userDto);
        } else {
            authResponse.setUser(this.collegeServices.getCollegeByIcCode(collegeModel.getIcCode()));
        }

        return new ResponseEntity<>(authResponse, HttpStatus.OK);

    }

    @PostMapping("/generate-otp")
    public ResponseEntity<?> generateOtp(@RequestBody OtpRequest otpRequest) {
        if (otpRequest.getEmail() != null) {
            // Generate a 6-digit OTP
            Long otp = generateRandomOtp();

            // Create a new OtpModel instance and save it in the repository
            OtpModel otpModel = new OtpModel(null, otp, otpRequest.getEmail(), null);

            otpRepository.save(otpModel);

            // Send OTP to the user (via email or SMS)
            sendOtp(otpRequest, otp);

            return ResponseEntity.ok("OTP has been generated and sent!");
        } else if (otpRequest.getPhone() != null) {
            // Generate a 6-digit OTP
            Long otp = generateRandomOtp();

            // Create a new OtpModel instance and save it in the repository
            OtpModel otpModel = new OtpModel(null, otp, null, otpRequest.getPhone());

            otpRepository.save(otpModel);

            // Send OTP to the user (via email or SMS)
            sendOtp(otpRequest, otp);

            return ResponseEntity.ok("OTP has been generated and sent!");
        }

        return ResponseEntity.badRequest().body("Invalid request!");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpRequest otpRequest) {
        if (otpRequest.getEmail() != null) {
            this.otpRepository
                    .findByEmailAndOtp(otpRequest.getEmail(), otpRequest.getOtp())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid otp"));
        } else if (otpRequest.getPhone() != null) {
            this.otpRepository
                    .findByPhoneAndOtp(otpRequest.getPhone(), otpRequest.getOtp())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid otp"));

        } else {
            throw new IllegalArgumentException("Invalid data for otp");
        }

        return new ResponseEntity<>(true, HttpStatus.OK);
    }

    private Long generateRandomOtp() {
        Random random = new Random();
        return (long) (100000 + random.nextInt(900000)); // Generates a 6-digit OTP
    }

    private void sendOtp(OtpRequest otpRequest, Long otp) {
        String subject = "Your OTP Code\n\n";
        String body = "<p>Your OTP code is: <strong>" + otp + "</strong></p>"
                + "<p>Please use this code to complete your verification.</p>"
                + "<p>Thank you!</p>";

        if (otpRequest.getEmail() != null) { // Send email
            emailServices.sendSimpleMessage(otpRequest.getEmail(), subject, body);
        } else if (otpRequest.getPhone() != null) { // Send phone
            List<String> messageArr = new ArrayList<>();
            messageArr.add(otp.toString());
            this.whatsAppService.sendWhatsAppMessage(
                    otpRequest.getPhone(),
                    messageArr,
                    "logincode"
            );
        }
    }



}
