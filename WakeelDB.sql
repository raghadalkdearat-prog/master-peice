CREATE DATABASE WakeelDB;
GO

USE WakeelDB;
GO

CREATE TABLE ContactMessages (
    ContactMessageID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    SenderName nvarchar(150) NOT NULL,
    SenderEmail nvarchar(256) NOT NULL,
    Subject nvarchar(200) NOT NULL,
    Message nvarchar(max) NOT NULL,
    Status varchar(20) NOT NULL,
    CreatedAt datetime2 NULL,
    PRIMARY KEY (ContactMessageID)
);
GO

CREATE TABLE Governorates (
    GovernorateID int IDENTITY(1,1) NOT NULL,
    NameAr nvarchar(80) NOT NULL UNIQUE,
    PRIMARY KEY (GovernorateID)
);
GO

CREATE TABLE Ministries (
    MinistryID int IDENTITY(1,1) NOT NULL,
    NameAr nvarchar(160) NOT NULL,
    IsActive bit NOT NULL DEFAULT (1),
    PRIMARY KEY (MinistryID)
);
GO

CREATE TABLE Directorates (
    DirectorateID int IDENTITY(1,1) NOT NULL,
    MinistryID int NOT NULL FOREIGN KEY REFERENCES Ministries(MinistryID),
    GovernorateID int NULL FOREIGN KEY REFERENCES Governorates(GovernorateID),
    NameAr nvarchar(160) NOT NULL,
    PRIMARY KEY (DirectorateID)
);
GO

CREATE TABLE Permissions (
    PermissionID int IDENTITY(1,1) NOT NULL,
    Code varchar(100) NOT NULL UNIQUE,
    PRIMARY KEY (PermissionID)
);
GO

CREATE TABLE Roles (
    RoleID int IDENTITY(1,1) NOT NULL,
    RoleName varchar(30) NOT NULL UNIQUE,
    PRIMARY KEY (RoleID)
);
GO

CREATE TABLE RolePermissions (
    RoleID int NOT NULL FOREIGN KEY REFERENCES Roles(RoleID),
    PermissionID int NOT NULL FOREIGN KEY REFERENCES Permissions(PermissionID),
    PRIMARY KEY (RoleID, PermissionID)
);
GO

CREATE TABLE ServiceCategories (
    CategoryID int IDENTITY(1,1) NOT NULL,
    NameAr nvarchar(150) NOT NULL,
    IsActive bit NOT NULL DEFAULT (1),
    PRIMARY KEY (CategoryID)
);
GO

CREATE TABLE Services (
    ServiceID int IDENTITY(1,1) NOT NULL,
    CategoryID int NOT NULL FOREIGN KEY REFERENCES ServiceCategories(CategoryID),
    MinistryID int NULL FOREIGN KEY REFERENCES Ministries(MinistryID),
    DirectorateID int NULL FOREIGN KEY REFERENCES Directorates(DirectorateID),
    NameAr nvarchar(180) NOT NULL,
    IsActive bit NOT NULL DEFAULT (1),
    Code varchar(50) NULL,
    DescriptionAr nvarchar(1000) NULL,
    PRIMARY KEY (ServiceID)
);
GO

CREATE TABLE ServiceRequirements (
    RequirementID int IDENTITY(1,1) NOT NULL,
    ServiceID int NOT NULL FOREIGN KEY REFERENCES Services(ServiceID),
    LabelAr nvarchar(300) NOT NULL,
    IsRequired bit NOT NULL DEFAULT (1),
    PRIMARY KEY (RequirementID)
);
GO

CREATE TABLE Users (
    UserID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    Email nvarchar(256) NOT NULL UNIQUE,
    PasswordHash nvarchar(max) NOT NULL,
    FullName nvarchar(150) NOT NULL,
    Phone varchar(20) NOT NULL,
    IsActive bit NOT NULL DEFAULT (1),
    CreatedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    NormalizedEmail nvarchar(256) NOT NULL UNIQUE,
    EmailConfirmed bit NOT NULL DEFAULT (0),
    PhoneConfirmed bit NOT NULL DEFAULT (0),
    SecurityStamp nvarchar(128) NULL,
    LastLoginAt datetime2 NULL,
    SuspendedAt datetime2 NULL,
    SuspensionReason nvarchar(1000) NULL,
    PRIMARY KEY (UserID)
);
GO

CREATE TABLE AgentApprovalHistory (
    ApprovalID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    AgentID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    ReviewerUserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Decision varchar(20) NOT NULL,
    ReviewedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    Reason nvarchar(1000) NULL,
    PRIMARY KEY (ApprovalID)
);
GO

CREATE TABLE AgentProfiles (
    AgentID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    ApprovalStatus varchar(20) NOT NULL,
    ExperienceYears int NOT NULL,
    ApprovedByUserID uniqueidentifier NULL FOREIGN KEY REFERENCES Users(UserID),
    ApprovalNote nvarchar(1000) NULL,
    ApprovedAt datetime2 NULL,
    PRIMARY KEY (AgentID)
);
GO

CREATE TABLE AgentServiceAreas (
    AgentID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    GovernorateID int NOT NULL FOREIGN KEY REFERENCES Governorates(GovernorateID),
    PRIMARY KEY (AgentID, GovernorateID)
);
GO

CREATE TABLE AgentServices (
    AgentID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    ServiceID int NOT NULL FOREIGN KEY REFERENCES Services(ServiceID),
    PRIMARY KEY (AgentID, ServiceID)
);
GO

CREATE TABLE AuditLogs (
    AuditID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    ActorUserID uniqueidentifier NULL FOREIGN KEY REFERENCES Users(UserID),
    EntityType varchar(60) NOT NULL,
    EntityID nvarchar(100) NOT NULL,
    Action varchar(100) NOT NULL,
    BeforeJSON nvarchar(max) NULL,
    AfterJSON nvarchar(max) NULL,
    CreatedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    PRIMARY KEY (AuditID)
);
GO

CREATE TABLE MediaFiles (
    MediaID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    UploadedByUserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    StorageKey nvarchar(700) NOT NULL,
    MimeType varchar(100) NOT NULL,
    ByteSize bigint NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    OriginalName nvarchar(220) NULL,
    ContentHash char(64) NULL,
    ScanStatus varchar(20) NULL,
    PRIMARY KEY (MediaID)
);
GO

CREATE TABLE PaymentMethods (
    PaymentMethodID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    UserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Provider varchar(60) NOT NULL,
    TokenRef nvarchar(300) NOT NULL,
    LastFour char(4) NULL,
    IsDefault bit NOT NULL DEFAULT (0),
    MethodType varchar(25) NULL,
    Brand varchar(30) NULL,
    ExpiryMonth tinyint NULL,
    ExpiryYear smallint NULL,
    IsActive bit NOT NULL DEFAULT (1),
    PRIMARY KEY (PaymentMethodID)
);
GO

CREATE TABLE PlatformSettings (
    SettingKey varchar(100) NOT NULL,
    SettingValue nvarchar(max) NOT NULL,
    ChangedByUserID uniqueidentifier NULL FOREIGN KEY REFERENCES Users(UserID),
    UpdatedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    PRIMARY KEY (SettingKey)
);
GO

CREATE TABLE Requests (
    RequestID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    DisplayNumber varchar(30) NOT NULL UNIQUE,
    ClientID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    RequestType varchar(30) NOT NULL,
    Title nvarchar(220) NOT NULL,
    Status varchar(30) NOT NULL,
    GovernorateID int NULL FOREIGN KEY REFERENCES Governorates(GovernorateID),
    Deadline datetime2 NULL,
    CreatedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    Description nvarchar(3000) NULL,
    TargetDays smallint NULL,
    SaleStage varchar(25) NULL,
    Visibility varchar(20) NOT NULL DEFAULT ('visible'),
    PreviousStatus varchar(30) NULL,
    UpdatedAt datetime2 NULL,
    CompletedAt datetime2 NULL,
    DeletedAt datetime2 NULL,
    Revision int NOT NULL DEFAULT (1),
    PRIMARY KEY (RequestID)
);
GO

CREATE TABLE AdminNotes (
    AdminNoteID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID),
    AdminUserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Body nvarchar(max) NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    PRIMARY KEY (AdminNoteID)
);
GO

CREATE TABLE CarListings (
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID),
    Make nvarchar(100) NOT NULL,
    Model nvarchar(100) NOT NULL,
    ModelYear smallint NOT NULL,
    MileageKm int NOT NULL,
    FuelType varchar(30) NOT NULL,
    AskingPriceJOD decimal(14,3) NOT NULL,
    Condition nvarchar(40) NULL,
    Area nvarchar(120) NULL,
    PRIMARY KEY (RequestID)
);
GO

CREATE TABLE DaleelRequestDetails (
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID),
    ApplicationUrl nvarchar(1500) NULL,
    Description nvarchar(max) NOT NULL,
    PRIMARY KEY (RequestID)
);
GO

CREATE TABLE MarketingBuyers (
    BuyerID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID),
    Name nvarchar(150) NOT NULL,
    Phone varchar(20) NOT NULL,
    Area nvarchar(150) NOT NULL,
    OfferPriceJOD decimal(14,3) NOT NULL,
    DecisionStatus varchar(20) NOT NULL,
    SubmittedByAgentID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    CreatedAt datetime2 NULL,
    DecidedAt datetime2 NULL,
    PRIMARY KEY (BuyerID)
);
GO

CREATE TABLE Offers (
    OfferID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID),
    AgentID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    AgentFeeJOD decimal(12,3) NOT NULL,
    DurationDays int NOT NULL,
    ProposalText nvarchar(max) NOT NULL,
    Status varchar(25) NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    SessionStartAt datetimeoffset NULL,
    SessionDurationMinutes smallint NULL,
    UpdatedAt datetime2 NULL,
    RequestRevision int NOT NULL DEFAULT (1),
    PRIMARY KEY (OfferID),
    UNIQUE (RequestID, OfferID),
    UNIQUE (RequestID, AgentID, OfferID)
);
GO

CREATE TABLE DaleelSessions (
    SessionID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID) UNIQUE,
    OfferID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Offers(OfferID),
    ScheduledStart datetimeoffset NOT NULL,
    ScheduledEnd datetimeoffset NOT NULL,
    MeetingProvider varchar(30) NOT NULL,
    MeetingRoomKey nvarchar(220) NOT NULL,
    Status varchar(25) NOT NULL,
    CompletedAt datetime2 NULL,
    PRIMARY KEY (SessionID),
    FOREIGN KEY (RequestID, OfferID) REFERENCES Offers(RequestID, OfferID)
);
GO

CREATE TABLE DaleelSessionEvents (
    EventID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    SessionID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES DaleelSessions(SessionID),
    ActorUserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    EventType varchar(30) NOT NULL,
    OccurredAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    PRIMARY KEY (EventID)
);
GO

CREATE TABLE OfferStatusHistory (
    OfferHistoryID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    OfferID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Offers(OfferID),
    ChangedByUserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    NewStatus varchar(25) NOT NULL,
    ChangedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    PRIMARY KEY (OfferHistoryID)
);
GO

CREATE TABLE PaymentInvoices (
    InvoiceID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID),
    OfferID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Offers(OfferID),
    AgentAmountJOD decimal(12,3) NOT NULL,
    PlatformFeeJOD decimal(12,3) NOT NULL,
    TotalJOD decimal(12,3) NOT NULL,
    Status varchar(25) NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    InvoiceNumber varchar(60) NULL,
    RequestRevision int NOT NULL DEFAULT (1),
    CancelledAt datetime2 NULL,
    Currency char(3) NOT NULL DEFAULT ('JOD'),
    PRIMARY KEY (InvoiceID),
    FOREIGN KEY (RequestID, OfferID) REFERENCES Offers(RequestID, OfferID)
);
GO

CREATE TABLE AgentEntitlements (
    EntitlementID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    InvoiceID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES PaymentInvoices(InvoiceID) UNIQUE,
    AgentID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    AmountJOD decimal(12,3) NOT NULL,
    Status varchar(25) NOT NULL,
    SettlementHold bit NOT NULL DEFAULT (0),
    ReleasedAt datetime2 NULL,
    PRIMARY KEY (EntitlementID)
);
GO

CREATE TABLE FinancialAdjustments (
    AdjustmentID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    InvoiceID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES PaymentInvoices(InvoiceID),
    AdminUserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    AmountJOD decimal(12,3) NOT NULL,
    Reason nvarchar(1000) NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    Kind varchar(20) NULL,
    PRIMARY KEY (AdjustmentID)
);
GO

CREATE TABLE PaymentAttempts (
    AttemptID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    InvoiceID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES PaymentInvoices(InvoiceID),
    PaymentMethodID uniqueidentifier NULL FOREIGN KEY REFERENCES PaymentMethods(PaymentMethodID),
    ProviderReference nvarchar(150) NULL,
    Status varchar(25) NOT NULL,
    AmountJOD decimal(12,3) NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    IdempotencyKey varchar(100) NULL,
    ProcessedAt datetime2 NULL,
    PRIMARY KEY (AttemptID)
);
GO

CREATE TABLE PaymentReceipts (
    ReceiptID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    AttemptID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES PaymentAttempts(AttemptID) UNIQUE,
    ReceiptNumber varchar(60) NOT NULL UNIQUE,
    IssuedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    PRIMARY KEY (ReceiptID)
);
GO

CREATE TABLE PropertyListings (
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID),
    PropertyType nvarchar(80) NOT NULL,
    SizeSqm decimal(12,2) NOT NULL,
    Condition nvarchar(50) NOT NULL,
    Area nvarchar(180) NOT NULL,
    AskingPriceJOD decimal(14,3) NOT NULL,
    PRIMARY KEY (RequestID)
);
GO

CREATE TABLE Refunds (
    RefundID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    InvoiceID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES PaymentInvoices(InvoiceID),
    AttemptID uniqueidentifier NULL FOREIGN KEY REFERENCES PaymentAttempts(AttemptID),
    AmountJOD decimal(12,3) NOT NULL,
    Status varchar(25) NOT NULL,
    Reason nvarchar(1000) NOT NULL,
    RequestedByUserID uniqueidentifier NULL FOREIGN KEY REFERENCES Users(UserID),
    CreatedAt datetime2 NULL,
    ProcessedAt datetime2 NULL,
    PRIMARY KEY (RefundID)
);
GO

CREATE TABLE RequestAssignments (
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID),
    OfferID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Offers(OfferID) UNIQUE,
    AgentID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    AssignedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    AcceptedAt datetime2 NULL,
    PRIMARY KEY (RequestID),
    FOREIGN KEY (RequestID, AgentID, OfferID) REFERENCES Offers(RequestID, AgentID, OfferID)
);
GO

CREATE TABLE RequestAttachments (
    AttachmentID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID),
    MediaID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES MediaFiles(MediaID),
    AttachmentType varchar(30) NOT NULL,
    Visibility varchar(20) NOT NULL,
    PhotoKind varchar(20) NULL,
    SortOrder smallint NOT NULL DEFAULT (0),
    PRIMARY KEY (AttachmentID)
);
GO

CREATE TABLE RequestProgressUpdates (
    UpdateID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID),
    AgentID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    StageNumber tinyint NOT NULL,
    NoteText nvarchar(3000) NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    PRIMARY KEY (UpdateID),
    UNIQUE (RequestID, UpdateID)
);
GO

CREATE TABLE ChatMessages (
    MessageID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID),
    SenderUserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    ProgressUpdateID uniqueidentifier NULL FOREIGN KEY REFERENCES RequestProgressUpdates(UpdateID),
    Body nvarchar(2000) NOT NULL,
    SentAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    MessageKind varchar(25) NOT NULL DEFAULT ('text'),
    PRIMARY KEY (MessageID),
    FOREIGN KEY (RequestID, ProgressUpdateID) REFERENCES RequestProgressUpdates(RequestID, UpdateID)
);
GO

CREATE TABLE ChatMessageAttachments (
    MessageID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES ChatMessages(MessageID),
    MediaID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES MediaFiles(MediaID),
    PRIMARY KEY (MessageID, MediaID)
);
GO

CREATE TABLE ChatMessageReads (
    MessageID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES ChatMessages(MessageID),
    UserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    ReadAt datetime2 NOT NULL,
    PRIMARY KEY (MessageID, UserID)
);
GO

CREATE TABLE ProgressUpdateReads (
    UpdateID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES RequestProgressUpdates(UpdateID),
    UserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    ReadAt datetime2 NOT NULL,
    PRIMARY KEY (UpdateID, UserID)
);
GO

CREATE TABLE RequestStatusHistory (
    StatusHistoryID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID),
    ChangedByUserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    OldStatus varchar(30) NULL,
    NewStatus varchar(30) NOT NULL,
    ChangedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    PRIMARY KEY (StatusHistoryID)
);
GO

CREATE TABLE RequestVisibilityHistory (
    VisibilityEventID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID),
    AdminUserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    IsVisible bit NOT NULL,
    Reason nvarchar(1000) NOT NULL,
    PRIMARY KEY (VisibilityEventID)
);
GO

CREATE TABLE Reviews (
    ReviewID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID) UNIQUE,
    ClientID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    AgentID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Rating tinyint NOT NULL,
    Comment nvarchar(2000) NOT NULL,
    Visibility varchar(20) NOT NULL,
    Title nvarchar(160) NULL,
    CreatedAt datetime2 NULL,
    UpdatedAt datetime2 NULL,
    PRIMARY KEY (ReviewID)
);
GO

CREATE TABLE ReviewReports (
    ReportID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    ReviewID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Reviews(ReviewID),
    ReporterUserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Reason nvarchar(1000) NOT NULL,
    Status varchar(20) NOT NULL,
    ResolvedByUserID uniqueidentifier NULL FOREIGN KEY REFERENCES Users(UserID),
    ResolvedAt datetime2 NULL,
    PRIMARY KEY (ReportID)
);
GO

CREATE TABLE Settlements (
    SettlementID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    AgentID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    TotalJOD decimal(12,3) NOT NULL,
    Status varchar(25) NOT NULL,
    SettledAt datetime2 NULL,
    CreatedAt datetime2 NULL,
    PRIMARY KEY (SettlementID)
);
GO

CREATE TABLE SettlementItems (
    SettlementID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Settlements(SettlementID),
    EntitlementID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES AgentEntitlements(EntitlementID),
    AmountJOD decimal(12,3) NOT NULL,
    PRIMARY KEY (SettlementID, EntitlementID)
);
GO

CREATE TABLE StandardRequestDetails (
    RequestID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Requests(RequestID),
    MinistryID int NOT NULL FOREIGN KEY REFERENCES Ministries(MinistryID),
    DirectorateID int NOT NULL FOREIGN KEY REFERENCES Directorates(DirectorateID),
    ServiceID int NOT NULL FOREIGN KEY REFERENCES Services(ServiceID),
    OtherServiceTitle nvarchar(200) NULL,
    BudgetJOD decimal(12,3) NULL,
    Priority varchar(15) NOT NULL,
    PRIMARY KEY (RequestID)
);
GO

CREATE TABLE SupportTickets (
    TicketID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    OpenedByUserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    RequestID uniqueidentifier NULL FOREIGN KEY REFERENCES Requests(RequestID),
    Category varchar(30) NOT NULL,
    ReasonCode varchar(50) NOT NULL,
    Priority varchar(15) NOT NULL,
    Status varchar(20) NOT NULL,
    Subject nvarchar(220) NULL,
    Description nvarchar(max) NULL,
    AssignedAdminUserID uniqueidentifier NULL FOREIGN KEY REFERENCES Users(UserID),
    OpenedAt datetime2 NULL,
    ClosedAt datetime2 NULL,
    PRIMARY KEY (TicketID)
);
GO

CREATE TABLE Notifications (
    NotificationID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    RecipientUserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    RequestID uniqueidentifier NULL FOREIGN KEY REFERENCES Requests(RequestID),
    TicketID uniqueidentifier NULL FOREIGN KEY REFERENCES SupportTickets(TicketID),
    Type varchar(30) NOT NULL,
    Title nvarchar(200) NOT NULL,
    IsRead bit NOT NULL DEFAULT (0),
    CreatedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    Body nvarchar(2000) NULL,
    ReadAt datetime2 NULL,
    PRIMARY KEY (NotificationID)
);
GO

CREATE TABLE SupportTicketEvents (
    TicketEventID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    TicketID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES SupportTickets(TicketID),
    ActorUserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    OldStatus varchar(20) NOT NULL,
    NewStatus varchar(20) NOT NULL,
    OccurredAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    PRIMARY KEY (TicketEventID)
);
GO

CREATE TABLE SupportTicketMessages (
    TicketMessageID uniqueidentifier NOT NULL DEFAULT (NEWSEQUENTIALID()),
    TicketID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES SupportTickets(TicketID),
    SenderUserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Body nvarchar(max) NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    PRIMARY KEY (TicketMessageID)
);
GO

CREATE TABLE UserPreferences (
    UserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    OffersEnabled bit NOT NULL DEFAULT (1),
    PaymentsEnabled bit NOT NULL DEFAULT (1),
    RequestsEnabled bit NOT NULL DEFAULT (1),
    PRIMARY KEY (UserID)
);
GO

CREATE TABLE UserProfiles (
    UserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Bio nvarchar(2000) NULL,
    GovernorateID int NULL FOREIGN KEY REFERENCES Governorates(GovernorateID),
    AvatarMediaID uniqueidentifier NULL FOREIGN KEY REFERENCES MediaFiles(MediaID),
    UpdatedAt datetime2 NULL,
    PRIMARY KEY (UserID)
);
GO

CREATE TABLE UserRoles (
    UserID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    RoleID int NOT NULL FOREIGN KEY REFERENCES Roles(RoleID),
    PRIMARY KEY (UserID, RoleID)
);
GO

SELECT COUNT(*) AS TotalTables FROM sys.tables WHERE schema_id = SCHEMA_ID('dbo');
SELECT COUNT(*) AS TotalForeignKeys FROM sys.foreign_keys WHERE schema_id = SCHEMA_ID('dbo');
