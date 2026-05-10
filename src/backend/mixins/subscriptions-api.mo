import SubLib "../lib/subscriptions";
import SubTypes "../types/subscriptions";
import Common "../types/common";
import Map "mo:core/Map";

mixin (
  subscriptions : Map.Map<Common.UserId, SubTypes.Subscription>,
) {
  public shared func createSubscription(
    userId : Common.UserId,
    planName : Text,
    startAsTrial : Bool,
  ) : async SubTypes.SubscriptionPublic {
    SubLib.createSubscription(subscriptions, userId, planName, startAsTrial);
  };

  public shared func updateSubscription(
    userId : Common.UserId,
    status : SubTypes.SubscriptionStatus,
    subscriptionEndDate : ?Common.Timestamp,
    amountPaid : Nat,
  ) : async ?SubTypes.SubscriptionPublic {
    SubLib.updateSubscription(subscriptions, userId, status, subscriptionEndDate, amountPaid);
  };

  public query func getSubscription(
    userId : Common.UserId,
  ) : async ?SubTypes.SubscriptionPublic {
    SubLib.getSubscription(subscriptions, userId);
  };

  public shared func activateSubscription(
    userId : Common.UserId,
    endDate : Common.Timestamp,
    amountPaid : Nat,
  ) : async ?SubTypes.SubscriptionPublic {
    SubLib.activateSubscription(subscriptions, userId, endDate, amountPaid);
  };

  public query func checkSubscriptionStatus(
    userId : Common.UserId,
  ) : async ?SubTypes.SubscriptionStatus {
    switch (SubLib.getSubscription(subscriptions, userId)) {
      case null { null };
      case (?sub) { ?sub.status };
    };
  };

  public shared func expireSubscription(userId : Common.UserId) : async ?SubTypes.SubscriptionPublic {
    SubLib.updateSubscription(subscriptions, userId, #expired, null, 0);
  };
};
