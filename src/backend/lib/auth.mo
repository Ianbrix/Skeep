import AuthTypes "../types/auth";
import Common "../types/common";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  public func createUser(
    users : List.List<AuthTypes.User>,
    sessions : Map.Map<Text, AuthTypes.Session>,
    state : { var nextUserId : Common.UserId },
    email : Text,
    passwordHash : Text,
    name : Text,
    role : AuthTypes.Role,
  ) : AuthTypes.CreateUserResult {
    switch (users.find(func(u) { u.email == email })) {
      case (?_) { return #err("Email already exists") };
      case null {};
    };
    let now = Time.now();
    let id = state.nextUserId;
    state.nextUserId += 1;
    let user : AuthTypes.User = {
      id;
      email;
      passwordHash;
      name;
      role;
      createdAt = now;
      var isActive = true;
      var lastActivity = now;
    };
    users.add(user);
    #ok(toPublic(user));
  };

  public func login(
    users : List.List<AuthTypes.User>,
    sessions : Map.Map<Text, AuthTypes.Session>,
    email : Text,
    passwordHash : Text,
  ) : AuthTypes.LoginResult {
    switch (users.find(func(u) { u.email == email })) {
      case null { #err("Invalid email or password") };
      case (?user) {
        if (user.passwordHash != passwordHash) {
          return #err("Invalid email or password");
        };
        if (not user.isActive) {
          return #err("Account is disabled");
        };
        let now = Time.now();
        user.lastActivity := now;
        let token = email.concat(now.toText());
        let session : AuthTypes.Session = {
          token;
          userId = user.id;
          createdAt = now;
          var lastActivity = now;
        };
        sessions.add(token, session);
        #ok({ token; user = toPublic(user) });
      };
    };
  };

  public func logout(
    sessions : Map.Map<Text, AuthTypes.Session>,
    token : Text,
  ) : Bool {
    switch (sessions.get(token)) {
      case null { false };
      case (?_) {
        sessions.remove(token);
        true;
      };
    };
  };

  public func getUserByToken(
    users : List.List<AuthTypes.User>,
    sessions : Map.Map<Text, AuthTypes.Session>,
    token : Text,
  ) : ?AuthTypes.UserPublic {
    switch (sessions.get(token)) {
      case null { null };
      case (?session) {
        let now = Time.now();
        let thirtyMin : Int = 30 * 60 * 1_000_000_000;
        if (now - session.lastActivity > thirtyMin) {
          sessions.remove(token);
          return null;
        };
        session.lastActivity := now;
        switch (users.find(func(u) { u.id == session.userId })) {
          case null { null };
          case (?user) {
            user.lastActivity := now;
            ?toPublic(user);
          };
        };
      };
    };
  };

  public func getUserById(
    users : List.List<AuthTypes.User>,
    id : Common.UserId,
  ) : ?AuthTypes.UserPublic {
    switch (users.find(func(u) { u.id == id })) {
      case null { null };
      case (?user) { ?toPublic(user) };
    };
  };

  public func toPublic(user : AuthTypes.User) : AuthTypes.UserPublic {
    {
      id = user.id;
      email = user.email;
      name = user.name;
      role = user.role;
      createdAt = user.createdAt;
      isActive = user.isActive;
      lastActivity = user.lastActivity;
    };
  };
};
