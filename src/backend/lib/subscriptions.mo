import SubTypes "../types/subscriptions";
import Common "../types/common";
import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  public func createSubscription(
    subscriptions : Map.Map<Common.UserId, SubTypes.Subscription>,
    userId : Common.UserId,
    planName : Text,
    startAsTrial : Bool,
  ) : SubTypes.SubscriptionPublic {
    let now = Time.now();
    // 3 days trial = 3 * 24 * 60 * 60 * 1_000_000_000 nanoseconds
    let threeDays : Int = 3 * 24 * 60 * 60 * 1_000_000_000;
    let sub : SubTypes.Subscription = {
      userId;
      var status = if (startAsTrial) { #trial } else { #active };
      trialStartDate = if (startAsTrial) { ?now } else { null };
      var subscriptionStartDate = if (startAsTrial) { null } else { ?now };
      var subscriptionEndDate = if (startAsTrial) { ?(now + threeDays) } else { null };
      planName;
      var amountPaid = 0;
    };
    subscriptions.add(userId, sub);
    toPublic(sub);
  };

  public func updateSubscription(
    subscriptions : Map.Map<Common.UserId, SubTypes.Subscription>,
    userId : Common.UserId,
    status : SubTypes.SubscriptionStatus,
    subscriptionEndDate : ?Common.Timestamp,
    amountPaid : Nat,
  ) : ?SubTypes.SubscriptionPublic {
    switch (subscriptions.get(userId)) {
      case null { null };
      case (?sub) {
        sub.status := status;
        sub.subscriptionEndDate := subscriptionEndDate;
        sub.amountPaid := amountPaid;
        ?toPublic(sub);
      };
    };
  };

  public func getSubscription(
    subscriptions : Map.Map<Common.UserId, SubTypes.Subscription>,
    userId : Common.UserId,
  ) : ?SubTypes.SubscriptionPublic {
    switch (subscriptions.get(userId)) {
      case null { null };
      case (?sub) { ?toPublic(sub) };
    };
  };

  public func activateSubscription(
    subscriptions : Map.Map<Common.UserId, SubTypes.Subscription>,
    userId : Common.UserId,
    endDate : Common.Timestamp,
    amountPaid : Nat,
  ) : ?SubTypes.SubscriptionPublic {
    switch (subscriptions.get(userId)) {
      case null { null };
      case (?sub) {
        sub.status := #active;
        sub.subscriptionStartDate := ?Time.now();
        sub.subscriptionEndDate := ?endDate;
        sub.amountPaid := amountPaid;
        ?toPublic(sub);
      };
    };
  };

  public func toPublic(s : SubTypes.Subscription) : SubTypes.SubscriptionPublic {
    {
      userId = s.userId;
      status = s.status;
      trialStartDate = s.trialStartDate;
      subscriptionStartDate = s.subscriptionStartDate;
      subscriptionEndDate = s.subscriptionEndDate;
      planName = s.planName;
      amountPaid = s.amountPaid;
    };
  };
};
