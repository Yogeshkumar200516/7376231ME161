-- 1. users (both HR and students)
CREATE TABLE users (
  id            CHAR(36)      NOT NULL DEFAULT (UUID()),
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('hr','student') NOT NULL DEFAULT 'student',
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_users_role (role),
  INDEX idx_users_email (email)
);

-- 2. notifications (one record per broadcast)
CREATE TABLE notifications (
  id               CHAR(36)     NOT NULL DEFAULT (UUID()),
  created_by       CHAR(36)     NOT NULL,
  notification_type ENUM('Placement','Result','Event') NOT NULL,
  message          VARCHAR(255) NOT NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_recipients INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  INDEX idx_notif_type (notification_type),
  INDEX idx_notif_created_at (created_at),
  INDEX idx_notif_created_by (created_by),
  CONSTRAINT fk_notif_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 3. student_notifications (per-student read state — Stage 2, 3, 4, 6, 7)
CREATE TABLE student_notifications (
  id              BIGINT       NOT NULL AUTO_INCREMENT,
  notification_id CHAR(36)     NOT NULL,
  student_id      CHAR(36)     NOT NULL,
  is_read         TINYINT(1)   NOT NULL DEFAULT 0,
  read_at         DATETIME     NULL,
  delivered_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_student_notif (student_id, notification_id),
  INDEX idx_sn_student_unread (student_id, is_read, delivered_at),
  INDEX idx_sn_notification   (notification_id),
  CONSTRAINT fk_sn_notif   FOREIGN KEY (notification_id) REFERENCES notifications(id),
  CONSTRAINT fk_sn_student FOREIGN KEY (student_id)      REFERENCES users(id)
);

-- 4. notification_delivery_log (email + push tracking — Stage 5)
CREATE TABLE notification_delivery_log (
  id              BIGINT        NOT NULL AUTO_INCREMENT,
  notification_id CHAR(36)      NOT NULL,
  student_id      CHAR(36)      NOT NULL,
  channel         ENUM('email','in_app') NOT NULL,
  status          ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
  retry_count     INT           NOT NULL DEFAULT 0,
  error_message   TEXT          NULL,
  attempted_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  succeeded_at    DATETIME      NULL,
  PRIMARY KEY (id),
  INDEX idx_log_status   (status, attempted_at),
  INDEX idx_log_notif    (notification_id),
  INDEX idx_log_student  (student_id),
  CONSTRAINT fk_log_notif   FOREIGN KEY (notification_id) REFERENCES notifications(id),
  CONSTRAINT fk_log_student FOREIGN KEY (student_id)      REFERENCES users(id)
);

-- 5. notification_queue (async bulk send — Stage 5)
CREATE TABLE notification_queue (
  id              BIGINT   NOT NULL AUTO_INCREMENT,
  notification_id CHAR(36) NOT NULL,
  student_id      CHAR(36) NOT NULL,
  channel         ENUM('email','in_app') NOT NULL,
  status          ENUM('pending','processing','done','failed') NOT NULL DEFAULT 'pending',
  retry_count     INT      NOT NULL DEFAULT 0,
  scheduled_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at    DATETIME NULL,
  PRIMARY KEY (id),
  INDEX idx_queue_pending  (status, scheduled_at),
  INDEX idx_queue_notif    (notification_id),
  CONSTRAINT fk_queue_notif   FOREIGN KEY (notification_id) REFERENCES notifications(id),
  CONSTRAINT fk_queue_student FOREIGN KEY (student_id)      REFERENCES users(id)
);

-- 6. sessions (login / auth)
CREATE TABLE sessions (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36)     NOT NULL,
  token      VARCHAR(512) NOT NULL UNIQUE,
  expires_at DATETIME     NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_sessions_token   (token),
  INDEX idx_sessions_user    (user_id),
  INDEX idx_sessions_expires (expires_at),
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id)
);