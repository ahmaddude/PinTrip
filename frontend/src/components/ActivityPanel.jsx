import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, UserPlus, UserCheck, AtSign, Bell, CheckCheck } from "lucide-react";
import api from "../utils/api";

const notificationIcons = {
  like: { icon: Heart, color: "text-[#A23B3B]", bg: "bg-[#F4E4DE]" },
  comment: { icon: MessageCircle, color: "text-[#35503F]", bg: "bg-[#E7DFCE]" },
  follow: { icon: UserPlus, color: "text-[#B8863B]", bg: "bg-[#F2ECE0]" },
  followAccepted: { icon: UserCheck, color: "text-[#35503F]", bg: "bg-[#E7DFCE]" },
  mention: { icon: AtSign, color: "text-[#35503F]", bg: "bg-[#E7DFCE]" },
  newPost: { icon: Bell, color: "text-[#B8863B]", bg: "bg-[#F2ECE0]" },
};

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function ActivityPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const fetchNotifications = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/notifications?page=${pageNum}&limit=15`);
      if (pageNum === 1) {
        setNotifications(res.data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...res.data.notifications]);
      }
      setHasMore(pageNum < res.data.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.pin) {
      return `/pin/${notification.pin._id}`;
    }
    return `/profile/${notification.sender._id}`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-2 left-2 sm:right-0 sm:left-auto top-12 bg-white rounded-md shadow-lg shadow-[#20220000]/10 border border-[#D8CFBC] w-auto sm:w-96 max-h-[calc(100dvh-5rem)] sm:max-h-[70vh] z-50 flex flex-col overscroll-contain"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDE7D9]">
        <h3
          className="text-sm font-semibold text-[#202A22]"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Activity
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-xs text-[#35503F] hover:text-[#202A22] transition font-medium"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 && !loading ? (
          <div className="py-12 text-center">
            <Bell size={32} className="text-[#D8CFBC] mx-auto mb-3" />
            <p className="text-sm text-[#9A9384]">No activity yet</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => {
              const iconConfig = notificationIcons[notification.type] || notificationIcons.like;
              const Icon = iconConfig.icon;
              return (
                <Link
                  key={notification._id}
                  to={getNotificationLink(notification)}
                  onClick={() => {
                    if (!notification.read) markAsRead(notification._id);
                    onClose();
                  }}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-[#F2ECE0] transition border-b border-[#EDE7D9] last:border-b-0 ${
                    !notification.read ? "bg-[#F2ECE0]/50" : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {notification.sender?.avatar ? (
                      <img
                        src={notification.sender.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#35503F] text-[#F2ECE0] flex items-center justify-center text-sm font-semibold">
                        {notification.sender?.name?.charAt(0)}
                      </div>
                    )}
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${iconConfig.bg}`}
                    >
                      <Icon size={10} className={iconConfig.color} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#202A22] leading-snug">
                      <span className="font-medium">{notification.sender?.name}</span>{" "}
                      <span className="text-[#6B6558]">
                        {notification.type === "like" && "liked your pin"}
                        {notification.type === "comment" && "commented on your pin"}
                        {notification.type === "follow" && "wants to follow you"}
                        {notification.type === "followAccepted" && "accepted your follow request"}
                        {notification.type === "mention" && "mentioned you in a pin"}
                        {notification.type === "newPost" && "posted a new pin"}
                      </span>
                    </p>
                    <p className="text-xs text-[#9A9384] mt-1">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>
                  {notification.pin?.images?.[0] && (
                    <img
                      src={notification.pin.images[0].url}
                      alt=""
                      className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                    />
                  )}
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-[#35503F] flex-shrink-0 mt-2" />
                  )}
                </Link>
              );
            })}
            {hasMore && (
              <button
                onClick={() => fetchNotifications(page + 1)}
                disabled={loading}
                className="w-full py-3 text-sm text-[#35503F] hover:bg-[#F2ECE0] transition font-medium disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
