export enum ROLES {
  USER = "user",
  ADMIN = "admin",
}

export interface SessionToken {
  sessionId: string;
  createdAt: number;
}

export enum REPORT_STATUS {
  PENDING = "pending",
  RESOLVED = "resolved",
  REJECTED = "rejected",
  IN_PROGRESS = "in_progress", // Seen by the admin but not yet resolved
}

export enum TYPE_OF_REPORT {
  SPAM = "spam", // unwanted message multiple times repeated
  INAPPROPRIATE_CONTENT = "inappropriate_content", // sexual and nudity content
  HARASSMENT = "harassment", // slurs and insults and bullying
  HATE_SPEECH = "hate_speech", // racism, sexism, etc.
  SELF_HARM = "self_harm", // talking about hurting themselves
  UNDERAGE_USER = "underage_user", // user appears to be a minor
  SCAM_OR_PHISHING = "scam_or_phishing", // requests for money or links to external sites
  OTHER = "other", // any other type of report
}
