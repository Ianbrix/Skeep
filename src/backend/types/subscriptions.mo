import Common "common";

module {
  public type SubscriptionStatus = { #trial; #active; #expired };

  public type Subscription = {
    userId : Common.UserId;
    var status : SubscriptionStatus;
    trialStartDate : ?Common.Timestamp;
    var subscriptionStartDate : ?Common.Timestamp;
    var subscriptionEndDate : ?Common.Timestamp;
    planName : Text;
    var amountPaid : Nat;
  };

  public type SubscriptionPublic = {
    userId : Common.UserId;
    status : SubscriptionStatus;
    trialStartDate : ?Common.Timestamp;
    subscriptionStartDate : ?Common.Timestamp;
    subscriptionEndDate : ?Common.Timestamp;
    planName : Text;
    amountPaid : Nat;
  };
};
