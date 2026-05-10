import AuthLib "../lib/auth";
import AuthTypes "../types/auth";
import Common "../types/common";
import List "mo:core/List";
import Map "mo:core/Map";

mixin (
  users : List.List<AuthTypes.User>,
  sessions : Map.Map<Text, AuthTypes.Session>,
  authState : { var nextUserId : Common.UserId },
) {
  public shared func createUser(
    email : Text,
    passwordHash : Text,
    name : Text,
    role : AuthTypes.Role,
  ) : async AuthTypes.CreateUserResult {
    AuthLib.createUser(users, sessions, authState, email, passwordHash, name, role);
  };

  public shared func login(
    email : Text,
    passwordHash : Text,
  ) : async AuthTypes.LoginResult {
    AuthLib.login(users, sessions, email, passwordHash);
  };

  public shared func logout(token : Text) : async Bool {
    AuthLib.logout(sessions, token);
  };

  public query func getUserByToken(token : Text) : async ?AuthTypes.UserPublic {
    AuthLib.getUserByToken(users, sessions, token);
  };

  public query func getUserById(id : Common.UserId) : async ?AuthTypes.UserPublic {
    AuthLib.getUserById(users, id);
  };
};
