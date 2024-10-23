package com.dcfest.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.dcfest.models.CollegeModel;
import com.dcfest.models.UserModel;
import com.dcfest.repositories.CollegeRepository;
import com.dcfest.repositories.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    CollegeRepository collegeRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        UserModel user = this.userRepository.findByEmail(username).orElse(null);
        if (user != null) {
            // Create UserDetails object using user data
            return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                    .password(user.getPassword())
                    .roles("USER") // Add user roles if needed
                    .build();
        }

        CollegeModel collegeModel = this.collegeRepository.findByEmail(username).orElse(null);
        if (collegeModel == null) {
            collegeModel = this.collegeRepository.findByIcCode(username).orElse(null);
        }

        System.out.println("collegeModel: " + collegeModel);

        if (collegeModel != null) {
            // Create UserDetails object using college data
            return org.springframework.security.core.userdetails.User.withUsername(username)
                    .password(collegeModel.getPassword())
                    .roles("COLLEGE") // Add user roles if needed
                    .build();
        }

        throw new UsernameNotFoundException("User/College not found with username: " + username);
    }

}