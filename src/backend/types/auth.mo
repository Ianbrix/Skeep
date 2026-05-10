import Common "common";

module {
  public type Role = { #treasurer; #chairperson };

  public type User = {
    id : Common.UserId;
    email : Text;
    passwordHash : Text;
    name : Text;
    role : Role;
    createdAt : Common.Timestamp;
    var isActive : Bool;
    var lastActivity : Common.Timestamp;
  };

  public type UserPublic = {
    id : Common.UserId;
    email : Text;
    name : Text;
    role : Role;
    createdAt : Common.Timestamp;
    isActive : Bool;
    lastActivity : Common.Timestamp;
  };

  public type Session = {
    token : Text;
    userId : Common.UserId;
    createdAt : Common.Timestamp;
    var lastActivity : Common.Timestamp;
  };

  public type LoginResult = { #ok : { token : Text; user : UserPublic }; #err : Text };
  public type CreateUserResult = { #ok : UserPublic; #err : Text };
};
