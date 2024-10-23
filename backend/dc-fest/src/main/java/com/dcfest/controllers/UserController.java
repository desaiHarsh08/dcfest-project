package com.dcfest.controllers;

import com.dcfest.dtos.UserDto;
import com.dcfest.services.UserServices;
import com.dcfest.utils.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserServices userServices;

    @GetMapping
    public ResponseEntity<PageResponse<UserDto>> getAllUsers(@RequestParam("page") int pageNumber) {
        PageResponse<UserDto> users = userServices.getAllUsers(pageNumber);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<PageResponse<UserDto>> getUsersByType(@RequestParam(defaultValue = "0") int pageNumber, @PathVariable String type) {
        PageResponse<UserDto> users = userServices.getUsersByType(pageNumber, type);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/college/{collegeId}")
    public ResponseEntity<PageResponse<UserDto>> getUsersByCollegeId(@RequestParam(defaultValue = "0") int pageNumber, @PathVariable Long collegeId) {
        PageResponse<UserDto> users = userServices.getUsersByCollegeId(pageNumber, collegeId);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String email) {
        UserDto user = userServices.getUserByEmail(email);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto user = userServices.getUserById(id);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PutMapping
    public ResponseEntity<UserDto> updateUser(@RequestBody UserDto userDto) {
        UserDto updatedUser = userServices.updateUser(userDto);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestParam String email, @RequestParam String rawPassword) {
        boolean isReset = userServices.resetPassword(email, rawPassword);
        if (isReset) {
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/college/{collegeId}")
    public ResponseEntity<Void> deleteUserByCollegesId(@PathVariable Long collegeId) {
        userServices.deleteUserByCollegesId(collegeId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
