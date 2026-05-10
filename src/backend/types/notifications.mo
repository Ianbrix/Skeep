import Common "common";

module {
  public type NotificationType = {
    #budgetAlert;
    #coaDeadline;
    #missingReceipt;
    #pendingApproval;
    #subscriptionReminder;
  };

  public type Notification = {
    id : Common.NotificationId;
    userId : Common.UserId;
    notifType : NotificationType;
    title : Text;
    message : Text;
    var isRead : Bool;
    createdAt : Common.Timestamp;
  };

  public type NotificationPublic = {
    id : Common.NotificationId;
    userId : Common.UserId;
    notifType : NotificationType;
    title : Text;
    message : Text;
    isRead : Bool;
    createdAt : Common.Timestamp;
  };
};
