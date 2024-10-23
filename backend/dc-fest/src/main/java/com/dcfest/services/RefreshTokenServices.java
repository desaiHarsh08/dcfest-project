package com.dcfest.services;

import com.dcfest.models.RefreshTokenModel;

public interface RefreshTokenServices {

    RefreshTokenModel createRefreshToken(String email);

    RefreshTokenModel verifyRefreshToken(String email);

}
