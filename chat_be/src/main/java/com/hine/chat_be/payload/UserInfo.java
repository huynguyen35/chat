package com.hine.chat_be.payload;

import com.hine.chat_be.entity.User;

public class UserInfo {
    private Integer id;
    private String firstName;
    private String lastName;
    private String email;

    public UserInfo() {
    }

    public UserInfo(Integer id, String firstName, String lastName, String email) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }

    public UserInfo toUserDTO(User user) {
        return new UserInfo(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail());
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
