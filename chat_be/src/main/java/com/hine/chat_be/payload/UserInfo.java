package com.hine.chat_be.payload;

import com.hine.chat_be.entity.User;

public class UserInfo {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String avt;

    public UserInfo() {
    }

    public UserInfo(Long id, String firstName, String lastName, String email, String avt) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.avt = avt;
    }

    public UserInfo toUserDTO(User user) {
        return new UserInfo(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getAvt());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public String getAvt() {
        return avt;
    }

    public void setAvt(String avt) {
        this.avt = avt;
    }
}
