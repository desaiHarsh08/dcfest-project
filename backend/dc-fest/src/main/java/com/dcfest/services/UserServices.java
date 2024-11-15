package com.dcfest.services;

import com.dcfest.dtos.UserDto;
import com.dcfest.utils.PageResponse;

public interface UserServices {

    UserDto creatUser(UserDto userDto);

    PageResponse<UserDto> getAllUsers(int pageNumber);

    PageResponse<UserDto> getUsersByType(int pageNumber, String type);

    UserDto getUserByEmail(String email);

    UserDto getUserById(Long id);

    UserDto updateUser(UserDto userDto);

    boolean resetPassword(String email, String rawPassword);

}
