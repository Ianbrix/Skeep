import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Budget {
    fiscalYear: bigint;
    totalBudget: bigint;
}
export interface TransactionPublic {
    id: TransactionId;
    paymentMethod: PaymentMethod;
    userId: UserId;
    date: Timestamp;
    createdAt: Timestamp;
    description: string;
    updatedAt: Timestamp;
    projectId?: ProjectId;
    checkDetails?: CheckDetailsPublic;
    txType: TransactionType;
    receiptId?: DocumentId;
    amount: bigint;
    supplierId?: SupplierId;
}
export type Timestamp = bigint;
export interface UserPublic {
    id: UserId;
    lastActivity: Timestamp;
    name: string;
    createdAt: Timestamp;
    role: Role;
    isActive: boolean;
    email: string;
}
export interface AuditLog {
    id: AuditLogId;
    action: AuditAction;
    userEmail: string;
    userId: UserId;
    description: string;
    timestamp: Timestamp;
}
export interface Document {
    id: DocumentId;
    linkedTransactionId?: TransactionId;
    linkedProjectId?: ProjectId;
    fileName: string;
    fileType: string;
    storageKey: string;
    uploadedAt: Timestamp;
    uploadedBy: UserId;
}
export interface CoaReportPublic {
    id: CoaReportId;
    status: CoaReportStatus;
    fiscalYear: bigint;
    quarter?: bigint;
    createdAt: Timestamp;
    submittedAt?: Timestamp;
    deadline?: Timestamp;
    reportType: CoaReportType;
    notes: string;
}
export type AuditLogId = bigint;
export interface AuditFilter {
    action?: AuditAction;
    userId?: UserId;
    toDate?: Timestamp;
    fromDate?: Timestamp;
}
export type CreateUserResult = {
    __kind__: "ok";
    ok: UserPublic;
} | {
    __kind__: "err";
    err: string;
};
export type TransactionId = bigint;
export interface SupplierPublic {
    id: SupplierId;
    tin: string;
    isVatRegistered: boolean;
    name: string;
    createdAt: Timestamp;
    contactPerson: string;
    address: string;
    phone: string;
}
export interface ProjectPublic {
    id: ProjectId;
    status: ProjectStatus;
    endDate?: Timestamp;
    name: string;
    createdAt: Timestamp;
    description: string;
    totalExpenses: bigint;
    budgetAllocation: bigint;
    updatedAt: Timestamp;
    startDate: Timestamp;
}
export type AllocationId = bigint;
export type DocumentId = bigint;
export type SupplierId = bigint;
export interface AddTransactionInput {
    paymentMethod: PaymentMethod;
    date: Timestamp;
    description: string;
    projectId?: ProjectId;
    checkDetails?: CheckDetailsPublic;
    txType: TransactionType;
    receiptId?: DocumentId;
    amount: bigint;
    supplierId?: SupplierId;
}
export interface Purchase {
    date: Timestamp;
    description: string;
    purchaseId: PurchaseId;
    amount: bigint;
    supplierId: SupplierId;
    transactionId: TransactionId;
}
export interface CheckDetailsPublic {
    status: CheckStatus;
    bankName: string;
    checkNumber?: string;
    checkDate: Timestamp;
    payee: string;
    purpose: string;
}
export interface NotificationPublic {
    id: NotificationId;
    title: string;
    notifType: NotificationType;
    userId: UserId;
    createdAt: Timestamp;
    isRead: boolean;
    message: string;
}
export interface SubscriptionPublic {
    status: SubscriptionStatus;
    subscriptionEndDate?: Timestamp;
    userId: UserId;
    amountPaid: bigint;
    subscriptionStartDate?: Timestamp;
    trialStartDate?: Timestamp;
    planName: string;
}
export interface TransactionFilter {
    paymentMethod?: PaymentMethod;
    toDate?: Timestamp;
    projectId?: ProjectId;
    fromDate?: Timestamp;
    txType?: TransactionType;
}
export interface AddProjectInput {
    endDate?: Timestamp;
    name: string;
    description: string;
    budgetAllocation: bigint;
    startDate: Timestamp;
}
export interface SupportingDocPublic {
    isSubmitted: boolean;
    linkedReportId: CoaReportId;
    docType: string;
}
export type UserId = bigint;
export type NotificationId = bigint;
export type PurchaseId = bigint;
export type ProjectId = bigint;
export type CoaReportId = bigint;
export type LoginResult = {
    __kind__: "ok";
    ok: {
        token: string;
        user: UserPublic;
    };
} | {
    __kind__: "err";
    err: string;
};
export interface AllocationPublic {
    id: AllocationId;
    name: string;
    allocatedAmount: bigint;
    spentAmount: bigint;
}
export enum AuditAction {
    generateReport = "generateReport",
    deleteTransaction = "deleteTransaction",
    other = "other",
    editTransaction = "editTransaction",
    login = "login",
    addTransaction = "addTransaction"
}
export enum CheckStatus {
    cancelled = "cancelled",
    issued = "issued",
    pendingIssuance = "pendingIssuance",
    cleared = "cleared"
}
export enum CoaReportStatus {
    pendingReview = "pendingReview",
    submitted = "submitted",
    needsRevision = "needsRevision",
    approved = "approved",
    draft = "draft"
}
export enum CoaReportType {
    notesToFS = "notesToFS",
    inventoryReport = "inventoryReport",
    asrp = "asrp",
    qsrp = "qsrp",
    raaf = "raaf",
    budgetVsActual = "budgetVsActual"
}
export enum NotificationType {
    budgetAlert = "budgetAlert",
    coaDeadline = "coaDeadline",
    missingReceipt = "missingReceipt",
    pendingApproval = "pendingApproval",
    subscriptionReminder = "subscriptionReminder"
}
export enum PaymentMethod {
    cash = "cash",
    check = "check",
    bankTransfer = "bankTransfer",
    gcash = "gcash"
}
export enum ProjectStatus {
    completed = "completed",
    ongoing = "ongoing",
    planning = "planning"
}
export enum Role {
    chairperson = "chairperson",
    treasurer = "treasurer"
}
export enum SubscriptionStatus {
    trial = "trial",
    active = "active",
    expired = "expired"
}
export enum TransactionType {
    projectExpenses = "projectExpenses",
    expenses = "expenses",
    cashAdvance = "cashAdvance",
    reimbursement = "reimbursement",
    income = "income"
}
export interface backendInterface {
    activateSubscription(userId: UserId, endDate: Timestamp, amountPaid: bigint): Promise<SubscriptionPublic | null>;
    addAllocation(name: string, amount: bigint): Promise<AllocationPublic>;
    addAuditLog(userId: UserId, userEmail: string, action: AuditAction, description: string): Promise<AuditLog>;
    addCoaReport(reportType: CoaReportType, fiscalYear: bigint, quarter: bigint | null, deadline: Timestamp | null): Promise<CoaReportPublic>;
    addDocument(fileName: string, fileType: string, uploadedBy: UserId, linkedTransactionId: TransactionId | null, linkedProjectId: ProjectId | null, storageKey: string): Promise<Document>;
    addNotification(userId: UserId, notifType: NotificationType, title: string, message: string): Promise<NotificationPublic>;
    addProject(input: AddProjectInput): Promise<ProjectPublic>;
    addPurchase(supplierId: SupplierId, transactionId: TransactionId, amount: bigint, date: Timestamp, description: string): Promise<Purchase>;
    addSupplier(name: string, tin: string, isVatRegistered: boolean, contactPerson: string, phone: string, address: string): Promise<SupplierPublic>;
    addTransaction(input: AddTransactionInput, userId: UserId): Promise<TransactionPublic>;
    checkSubscriptionStatus(userId: UserId): Promise<SubscriptionStatus | null>;
    createSubscription(userId: UserId, planName: string, startAsTrial: boolean): Promise<SubscriptionPublic>;
    createUser(email: string, passwordHash: string, name: string, role: Role): Promise<CreateUserResult>;
    deleteAllocation(id: AllocationId): Promise<boolean>;
    deleteDocument(id: DocumentId): Promise<boolean>;
    deleteProject(id: ProjectId): Promise<boolean>;
    deleteSupplier(id: SupplierId): Promise<boolean>;
    deleteTransaction(id: TransactionId): Promise<boolean>;
    dismissNotification(id: NotificationId): Promise<boolean>;
    expireSubscription(userId: UserId): Promise<SubscriptionPublic | null>;
    getActiveProjectsCount(): Promise<bigint>;
    getAllocations(): Promise<Array<AllocationPublic>>;
    getAuditLogs(filter: AuditFilter | null): Promise<Array<AuditLog>>;
    getBudget(): Promise<Budget | null>;
    getCoaReports(): Promise<Array<CoaReportPublic>>;
    getDashboardSummary(): Promise<{
        activeProjectsCount: bigint;
        totalIncome: bigint;
        totalExpenses: bigint;
        totalBudget?: bigint;
        remainingBalance?: bigint;
    }>;
    getDocumentById(id: DocumentId): Promise<Document | null>;
    getDocuments(): Promise<Array<Document>>;
    getDocumentsByProject(projectId: ProjectId): Promise<Array<Document>>;
    getDocumentsByTransaction(transactionId: TransactionId): Promise<Array<Document>>;
    getNotifications(userId: UserId): Promise<Array<NotificationPublic>>;
    getOverdueReports(): Promise<Array<CoaReportPublic>>;
    getProjectById(id: ProjectId): Promise<ProjectPublic | null>;
    getProjects(): Promise<Array<ProjectPublic>>;
    getPurchasesBySupplier(supplierId: SupplierId): Promise<Array<Purchase>>;
    getRecentLogs(limit: bigint): Promise<Array<AuditLog>>;
    getRemainingBalance(): Promise<bigint | null>;
    getSubscription(userId: UserId): Promise<SubscriptionPublic | null>;
    getSupplierById(id: SupplierId): Promise<SupplierPublic | null>;
    getSuppliers(): Promise<Array<SupplierPublic>>;
    getSupportingDocs(reportId: CoaReportId): Promise<Array<SupportingDocPublic>>;
    getTotalExpenses(): Promise<bigint>;
    getTotalIncome(): Promise<bigint>;
    getTransactionById(id: TransactionId): Promise<TransactionPublic | null>;
    getTransactions(filter: TransactionFilter | null): Promise<Array<TransactionPublic>>;
    getUnreadCount(userId: UserId): Promise<bigint>;
    getUserById(id: UserId): Promise<UserPublic | null>;
    getUserByToken(token: string): Promise<UserPublic | null>;
    login(email: string, passwordHash: string): Promise<LoginResult>;
    logout(token: string): Promise<boolean>;
    markAsRead(id: NotificationId): Promise<boolean>;
    setBudget(totalBudget: bigint, fiscalYear: bigint): Promise<Budget>;
    submitSupportingDoc(reportId: CoaReportId, docType: string): Promise<boolean>;
    updateAllocation(id: AllocationId, name: string, amount: bigint): Promise<AllocationPublic | null>;
    updateCoaReport(id: CoaReportId, status: CoaReportStatus, notes: string): Promise<CoaReportPublic | null>;
    updateProject(id: ProjectId, input: AddProjectInput): Promise<ProjectPublic | null>;
    updateProjectStatus(id: ProjectId, status: ProjectStatus): Promise<ProjectPublic | null>;
    updateSubscription(userId: UserId, status: SubscriptionStatus, subscriptionEndDate: Timestamp | null, amountPaid: bigint): Promise<SubscriptionPublic | null>;
    updateSupplier(id: SupplierId, name: string, tin: string, isVatRegistered: boolean, contactPerson: string, phone: string, address: string): Promise<SupplierPublic | null>;
    updateTransaction(id: TransactionId, input: AddTransactionInput): Promise<TransactionPublic | null>;
}
