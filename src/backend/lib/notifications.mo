import NotifTypes "../types/notifications";
import Common "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public func addNotification(
    notifications : List.List<NotifTypes.Notification>,
    state : { var nextNotifId : Common.NotificationId },
    userId : Common.UserId,
    notifType : NotifTypes.NotificationType,
    title : Text,
    message : Text,
  ) : NotifTypes.NotificationPublic {
    let now = Time.now();
    let id = state.nextNotifId;
    state.nextNotifId += 1;
    let notif : NotifTypes.Notification = {
      id;
      userId;
      notifType;
      title;
      message;
      var isRead = false;
      createdAt = now;
    };
    notifications.add(notif);
    toPublic(notif);
  };

  public func markAsRead(
    notifications : List.List<NotifTypes.Notification>,
    id : Common.NotificationId,
  ) : Bool {
    switch (notifications.find(func(n) { n.id == id })) {
      case null { false };
      case (?notif) {
        notif.isRead := true;
        true;
      };
    };
  };

  public func dismissNotification(
    notifications : List.List<NotifTypes.Notification>,
    id : Common.NotificationId,
  ) : Bool {
    switch (notifications.findIndex(func(n) { n.id == id })) {
      case null { false };
      case (?_) {
        let filtered = notifications.filter(func(n) { n.id != id });
        notifications.clear();
        notifications.append(filtered);
        true;
      };
    };
  };

  public func getNotifications(
    notifications : List.List<NotifTypes.Notification>,
    userId : Common.UserId,
  ) : [NotifTypes.NotificationPublic] {
    notifications
      .filter(func(n) { n.userId == userId })
      .map<NotifTypes.Notification, NotifTypes.NotificationPublic>(func(n) { toPublic(n) })
      .toArray();
  };

  public func getUnreadCount(
    notifications : List.List<NotifTypes.Notification>,
    userId : Common.UserId,
  ) : Nat {
    notifications
      .filter(func(n) { n.userId == userId and not n.isRead })
      .size();
  };

  public func toPublic(n : NotifTypes.Notification) : NotifTypes.NotificationPublic {
    {
      id = n.id;
      userId = n.userId;
      notifType = n.notifType;
      title = n.title;
      message = n.message;
      isRead = n.isRead;
      createdAt = n.createdAt;
    };
  };
};
