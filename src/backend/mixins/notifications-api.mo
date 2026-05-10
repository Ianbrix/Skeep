import NotifLib "../lib/notifications";
import NotifTypes "../types/notifications";
import Common "../types/common";
import List "mo:core/List";

mixin (
  notifications : List.List<NotifTypes.Notification>,
  notifState : { var nextNotifId : Common.NotificationId },
) {
  public shared func addNotification(
    userId : Common.UserId,
    notifType : NotifTypes.NotificationType,
    title : Text,
    message : Text,
  ) : async NotifTypes.NotificationPublic {
    NotifLib.addNotification(notifications, notifState, userId, notifType, title, message);
  };

  public shared func markAsRead(id : Common.NotificationId) : async Bool {
    NotifLib.markAsRead(notifications, id);
  };

  public shared func dismissNotification(id : Common.NotificationId) : async Bool {
    NotifLib.dismissNotification(notifications, id);
  };

  public query func getNotifications(userId : Common.UserId) : async [NotifTypes.NotificationPublic] {
    NotifLib.getNotifications(notifications, userId);
  };

  public query func getUnreadCount(userId : Common.UserId) : async Nat {
    NotifLib.getUnreadCount(notifications, userId);
  };
};
