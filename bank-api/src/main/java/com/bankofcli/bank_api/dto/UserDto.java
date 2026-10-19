package com.bankofcli.bank_api.dto;

import com.bankofcli.bank_api.model.User;

public record UserDto(String id, String firstName, String lastName, String username, String email) {

    public static UserDto from(User user) {
        return new UserDto(publicId(user.getId()), user.getFirstName(), user.getLastName(),
                user.getUsername(), user.getEmail());
    }

    /** Contract §2: user ids are strings like "u_42". */
    public static String publicId(Long id) {
        return "u_" + id;
    }
}