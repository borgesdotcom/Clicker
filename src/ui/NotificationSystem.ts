/**
 * Notification System - Displays temporary notifications for game events
 * Supports multiple notification types and auto-dismissal
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'mission';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration: number; // milliseconds
  timestamp: number;
}

export class NotificationSystem {
  private notifications: Notification[] = [];
  private container: HTMLElement | null = null;
  private maxNotifications = 3; // Max visible notifications at once

  constructor() {
    this.createContainer();
  }

  private createContainer(): void {
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.style.position = 'fixed';
    this.container.style.top = '20px';
    this.container.style.right = '20px';
    this.container.style.zIndex = '10000';
    this.container.style.pointerEvents = 'none';
    document.body.appendChild(this.container);
  }

  /**
   * Show a notification
   */
  show(message: string, type: NotificationType = 'info', duration: number = 3000): void {
    if (!this.container) return;

    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      message,
      type,
      duration,
      timestamp: Date.now(),
    };

    this.notifications.push(notification);
    this.render();

    // Auto-dismiss after duration
    setTimeout(() => {
      this.dismiss(notification.id);
    }, duration);

    // Limit number of notifications
    if (this.notifications.length > this.maxNotifications) {
      const oldest = this.notifications[0];
      if (oldest) {
        this.dismiss(oldest.id);
      }
    }
  }

  /**
   * Dismiss a notification by ID
   */
  private dismiss(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification && this.container) {
      const element = this.container.querySelector(`[data-notif-id="${id}"]`) as HTMLElement;
      if (element) {
        // Fade out animation matching HUD style
        element.style.transition = 'opacity 0.3s ease-in, transform 0.3s ease-in';
        element.style.opacity = '0';
        element.style.transform = 'translateX(100px)';
        setTimeout(() => {
          this.notifications = this.notifications.filter((n) => n.id !== id);
          this.render();
        }, 300);
        return;
      }
    }
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.render();
  }

  /**
   * Render all notifications
   */
  private render(): void {
    if (!this.container) return;

    // Clear container
    this.container.innerHTML = '';

    // Show only the most recent notifications
    const visibleNotifications = this.notifications.slice(-this.maxNotifications);

    visibleNotifications.forEach((notification, index) => {
      const notifElement = document.createElement('div');
      notifElement.className = 'notification';
      notifElement.setAttribute('data-notif-id', notification.id);
      
      // Match HUD styling: dark background, green border, Courier New font
      const borderColor = this.getBorderColor(notification.type);
      // Create glow color with reduced opacity
      const glowColor = borderColor.replace(/[\d.]+\)$/, '0.2)');
      notifElement.style.cssText = `
        background: rgba(0, 0, 0, 0.85);
        color: #fff;
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 4px;
        border: 2px solid ${borderColor};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 5px ${glowColor};
        pointer-events: auto;
        cursor: pointer;
        max-width: 320px;
        word-wrap: break-word;
        font-size: 13px;
        font-weight: bold;
        font-family: 'Courier New', monospace;
        text-shadow: 0 1px 0 #000, 0 -1px 0 #000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease-out;
      `;

      // Add icon based on type
      const icon = this.getIcon(notification.type);
      notifElement.innerHTML = `${icon} ${notification.message}`;

      // Add click to dismiss
      notifElement.addEventListener('click', () => {
        this.dismiss(notification.id);
      });

      if (this.container) {
        this.container.appendChild(notifElement);
      }

      // Trigger animation
      setTimeout(() => {
        notifElement.style.opacity = '1';
        notifElement.style.transform = 'translateX(0)';
      }, 10);

      // Stagger animations
      setTimeout(() => {
        notifElement.style.transitionDelay = `${index * 0.1}s`;
      }, 0);
    });
  }

  private getBorderColor(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'rgba(0, 255, 136, 0.5)'; // Green like HUD
      case 'warning':
        return 'rgba(255, 170, 0, 0.5)'; // Orange/yellow
      case 'error':
        return 'rgba(255, 68, 68, 0.5)'; // Red
      case 'achievement':
        return 'rgba(255, 215, 0, 0.5)'; // Gold
      case 'mission':
        return 'rgba(0, 255, 136, 0.7)'; // Brighter green for missions
      case 'info':
      default:
        return 'rgba(0, 255, 136, 0.5)'; // Default green
    }
  }

  private getIcon(type: NotificationType): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'achievement':
        return '🏆';
      case 'mission':
        return '🎯';
      case 'info':
      default:
        return 'ℹ️';
    }
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notifications = [];
    this.render();
  }
}

