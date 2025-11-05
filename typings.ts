/* eslint-disable */
import {
  CollectionCustomizer,
  TAggregation,
  TConditionTree,
  TPaginatedFilter,
  TPartialRow,
  TSortClause
} from '@forestadmin/agent';

export type AccountsCustomizer = CollectionCustomizer<Schema, 'accounts'>;
export type AccountsRecord = TPartialRow<Schema, 'accounts'>;
export type AccountsConditionTree = TConditionTree<Schema, 'accounts'>;
export type AccountsFilter = TPaginatedFilter<Schema, 'accounts'>;
export type AccountsSortClause = TSortClause<Schema, 'accounts'>;
export type AccountsAggregation = TAggregation<Schema, 'accounts'>;

export type AlertsCustomizer = CollectionCustomizer<Schema, 'alerts'>;
export type AlertsRecord = TPartialRow<Schema, 'alerts'>;
export type AlertsConditionTree = TConditionTree<Schema, 'alerts'>;
export type AlertsFilter = TPaginatedFilter<Schema, 'alerts'>;
export type AlertsSortClause = TSortClause<Schema, 'alerts'>;
export type AlertsAggregation = TAggregation<Schema, 'alerts'>;

export type AmlAlertsCustomizer = CollectionCustomizer<Schema, 'aml_alerts'>;
export type AmlAlertsRecord = TPartialRow<Schema, 'aml_alerts'>;
export type AmlAlertsConditionTree = TConditionTree<Schema, 'aml_alerts'>;
export type AmlAlertsFilter = TPaginatedFilter<Schema, 'aml_alerts'>;
export type AmlAlertsSortClause = TSortClause<Schema, 'aml_alerts'>;
export type AmlAlertsAggregation = TAggregation<Schema, 'aml_alerts'>;

export type ApplicationsCustomizer = CollectionCustomizer<Schema, 'applications'>;
export type ApplicationsRecord = TPartialRow<Schema, 'applications'>;
export type ApplicationsConditionTree = TConditionTree<Schema, 'applications'>;
export type ApplicationsFilter = TPaginatedFilter<Schema, 'applications'>;
export type ApplicationsSortClause = TSortClause<Schema, 'applications'>;
export type ApplicationsAggregation = TAggregation<Schema, 'applications'>;

export type AuditLogCustomizer = CollectionCustomizer<Schema, 'audit_log'>;
export type AuditLogRecord = TPartialRow<Schema, 'audit_log'>;
export type AuditLogConditionTree = TConditionTree<Schema, 'audit_log'>;
export type AuditLogFilter = TPaginatedFilter<Schema, 'audit_log'>;
export type AuditLogSortClause = TSortClause<Schema, 'audit_log'>;
export type AuditLogAggregation = TAggregation<Schema, 'audit_log'>;

export type CaseLinksCustomizer = CollectionCustomizer<Schema, 'case_links'>;
export type CaseLinksRecord = TPartialRow<Schema, 'case_links'>;
export type CaseLinksConditionTree = TConditionTree<Schema, 'case_links'>;
export type CaseLinksFilter = TPaginatedFilter<Schema, 'case_links'>;
export type CaseLinksSortClause = TSortClause<Schema, 'case_links'>;
export type CaseLinksAggregation = TAggregation<Schema, 'case_links'>;

export type CasesCustomizer = CollectionCustomizer<Schema, 'cases'>;
export type CasesRecord = TPartialRow<Schema, 'cases'>;
export type CasesConditionTree = TConditionTree<Schema, 'cases'>;
export type CasesFilter = TPaginatedFilter<Schema, 'cases'>;
export type CasesSortClause = TSortClause<Schema, 'cases'>;
export type CasesAggregation = TAggregation<Schema, 'cases'>;

export type CustomersCustomizer = CollectionCustomizer<Schema, 'customers'>;
export type CustomersRecord = TPartialRow<Schema, 'customers'>;
export type CustomersConditionTree = TConditionTree<Schema, 'customers'>;
export type CustomersFilter = TPaginatedFilter<Schema, 'customers'>;
export type CustomersSortClause = TSortClause<Schema, 'customers'>;
export type CustomersAggregation = TAggregation<Schema, 'customers'>;

export type DocumentsCustomizer = CollectionCustomizer<Schema, 'documents'>;
export type DocumentsRecord = TPartialRow<Schema, 'documents'>;
export type DocumentsConditionTree = TConditionTree<Schema, 'documents'>;
export type DocumentsFilter = TPaginatedFilter<Schema, 'documents'>;
export type DocumentsSortClause = TSortClause<Schema, 'documents'>;
export type DocumentsAggregation = TAggregation<Schema, 'documents'>;

export type NotesCustomizer = CollectionCustomizer<Schema, 'notes'>;
export type NotesRecord = TPartialRow<Schema, 'notes'>;
export type NotesConditionTree = TConditionTree<Schema, 'notes'>;
export type NotesFilter = TPaginatedFilter<Schema, 'notes'>;
export type NotesSortClause = TSortClause<Schema, 'notes'>;
export type NotesAggregation = TAggregation<Schema, 'notes'>;

export type TransactionsCustomizer = CollectionCustomizer<Schema, 'transactions'>;
export type TransactionsRecord = TPartialRow<Schema, 'transactions'>;
export type TransactionsConditionTree = TConditionTree<Schema, 'transactions'>;
export type TransactionsFilter = TPaginatedFilter<Schema, 'transactions'>;
export type TransactionsSortClause = TSortClause<Schema, 'transactions'>;
export type TransactionsAggregation = TAggregation<Schema, 'transactions'>;

export type UsersCustomizer = CollectionCustomizer<Schema, 'users'>;
export type UsersRecord = TPartialRow<Schema, 'users'>;
export type UsersConditionTree = TConditionTree<Schema, 'users'>;
export type UsersFilter = TPaginatedFilter<Schema, 'users'>;
export type UsersSortClause = TSortClause<Schema, 'users'>;
export type UsersAggregation = TAggregation<Schema, 'users'>;


export type Schema = {
  'accounts': {
    plain: {
      'balance_cents': number | null;
      'balanceFormatted': string | null;
      'currency': string | null;
      'currencyBadge': string | null;
      'customer_id': string | null;
      'iban': string | null;
      'id': string;
      'status': string | null;
      'statusBadge': string | null;
    };
    nested: {
      'customer': Schema['customers']['plain'] & Schema['customers']['nested'];
    };
    flat: {
      'customer:business_name': string | null;
      'customer:created_at': string;
      'customer:customerSince': string | null;
      'customer:email': string;
      'customer:first_name': string | null;
      'customer:fullName': string | null;
      'customer:id': string;
      'customer:last_name': string | null;
      'customer:phone': string | null;
      'customer:type': string;
      'customer:typeBadge': string | null;
      'customer:updated_at': string;
    };
  };
  'alerts': {
    plain: {
      'account_id': string | null;
      'alertAge': string | null;
      'alertTypeBadge': string | null;
      'customer_id': string | null;
      'details': any | null;
      'id': string;
      'riskIndicators': string | null;
      'severity': string;
      'severityBadge': string | null;
      'status': string | null;
      'statusBadge': string | null;
      'triggered_at': string | null;
      'type': string | null;
    };
    nested: {
      'account': Schema['accounts']['plain'] & Schema['accounts']['nested'];
      'customer': Schema['customers']['plain'] & Schema['customers']['nested'];
    };
    flat: {
      'account:balance_cents': number | null;
      'account:balanceFormatted': string | null;
      'account:currency': string | null;
      'account:currencyBadge': string | null;
      'account:customer_id': string | null;
      'account:iban': string | null;
      'account:id': string;
      'account:status': string | null;
      'account:statusBadge': string | null;
      'customer:business_name': string | null;
      'customer:created_at': string;
      'customer:customerSince': string | null;
      'customer:email': string;
      'customer:first_name': string | null;
      'customer:fullName': string | null;
      'customer:id': string;
      'customer:last_name': string | null;
      'customer:phone': string | null;
      'customer:type': string;
      'customer:typeBadge': string | null;
      'customer:updated_at': string;
      'account:customer:business_name': string | null;
      'account:customer:created_at': string;
      'account:customer:customerSince': string | null;
      'account:customer:email': string;
      'account:customer:first_name': string | null;
      'account:customer:fullName': string | null;
      'account:customer:id': string;
      'account:customer:last_name': string | null;
      'account:customer:phone': string | null;
      'account:customer:type': string;
      'account:customer:typeBadge': string | null;
      'account:customer:updated_at': string;
    };
  };
  'aml_alerts': {
    plain: {
      'alertAge': string | null;
      'created_at': string | null;
      'customer_id': string | null;
      'escalated_case_id': string | null;
      'id': string;
      'rule': string | null;
      'ruleBadge': string | null;
      'score': number | null;
      'scoreBadge': string | null;
      'status': string | null;
      'statusBadge': string | null;
    };
    nested: {
      'customer': Schema['customers']['plain'] & Schema['customers']['nested'];
    };
    flat: {
      'customer:business_name': string | null;
      'customer:created_at': string;
      'customer:customerSince': string | null;
      'customer:email': string;
      'customer:first_name': string | null;
      'customer:fullName': string | null;
      'customer:id': string;
      'customer:last_name': string | null;
      'customer:phone': string | null;
      'customer:type': string;
      'customer:typeBadge': string | null;
      'customer:updated_at': string;
    };
  };
  'applications': {
    plain: {
      'applicationAge': string | null;
      'customer_id': string | null;
      'id': string;
      'kyc_level': string | null;
      'kycLevelBadge': string | null;
      'notes': string | null;
      'onboardingStatusBadge': string | null;
      'priorityLevel': string | null;
      'reviewer': string | null;
      'risk_score': number | null;
      'riskScoreBadge': string | null;
      'sanctions_hits': number | null;
      'sanctionsStatus': string | null;
      'status': string | null;
      'submitted_at': string | null;
    };
    nested: {};
    flat: {};
  };
  'audit_log': {
    plain: {
      'action': string | null;
      'actionBadge': string | null;
      'actor': string | null;
      'actorRole': string | null;
      'created_at': string | null;
      'entity': string | null;
      'entity_id': string | null;
      'entityBadge': string | null;
      'id': number;
      'logAge': string | null;
      'payload': any | null;
    };
    nested: {};
    flat: {};
  };
  'case_links': {
    plain: {
      'alert_id': string;
      'case_id': string;
    };
    nested: {
      'alert': Schema['alerts']['plain'] & Schema['alerts']['nested'];
      'case': Schema['cases']['plain'] & Schema['cases']['nested'];
    };
    flat: {
      'alert:account_id': string | null;
      'alert:alertAge': string | null;
      'alert:alertTypeBadge': string | null;
      'alert:customer_id': string | null;
      'alert:details': any | null;
      'alert:id': string;
      'alert:riskIndicators': string | null;
      'alert:severity': string;
      'alert:severityBadge': string | null;
      'alert:status': string | null;
      'alert:statusBadge': string | null;
      'alert:triggered_at': string | null;
      'alert:type': string | null;
      'case:caseAge': string | null;
      'case:created_at': string | null;
      'case:id': string;
      'case:owner': string | null;
      'case:ownerBadge': string | null;
      'case:priority': string | null;
      'case:priorityBadge': string | null;
      'case:status': string | null;
      'case:statusBadge': string | null;
      'case:title': string | null;
      'alert:account:balance_cents': number | null;
      'alert:account:balanceFormatted': string | null;
      'alert:account:currency': string | null;
      'alert:account:currencyBadge': string | null;
      'alert:account:customer_id': string | null;
      'alert:account:iban': string | null;
      'alert:account:id': string;
      'alert:account:status': string | null;
      'alert:account:statusBadge': string | null;
      'alert:customer:business_name': string | null;
      'alert:customer:created_at': string;
      'alert:customer:customerSince': string | null;
      'alert:customer:email': string;
      'alert:customer:first_name': string | null;
      'alert:customer:fullName': string | null;
      'alert:customer:id': string;
      'alert:customer:last_name': string | null;
      'alert:customer:phone': string | null;
      'alert:customer:type': string;
      'alert:customer:typeBadge': string | null;
      'alert:customer:updated_at': string;
      'alert:account:customer:business_name': string | null;
      'alert:account:customer:created_at': string;
      'alert:account:customer:customerSince': string | null;
      'alert:account:customer:email': string;
      'alert:account:customer:first_name': string | null;
      'alert:account:customer:fullName': string | null;
      'alert:account:customer:id': string;
      'alert:account:customer:last_name': string | null;
      'alert:account:customer:phone': string | null;
      'alert:account:customer:type': string;
      'alert:account:customer:typeBadge': string | null;
      'alert:account:customer:updated_at': string;
    };
  };
  'cases': {
    plain: {
      'caseAge': string | null;
      'created_at': string | null;
      'id': string;
      'owner': string | null;
      'ownerBadge': string | null;
      'priority': string | null;
      'priorityBadge': string | null;
      'status': string | null;
      'statusBadge': string | null;
      'title': string | null;
    };
    nested: {};
    flat: {};
  };
  'customers': {
    plain: {
      'business_name': string | null;
      'created_at': string;
      'customerSince': string | null;
      'email': string;
      'first_name': string | null;
      'fullName': string | null;
      'id': string;
      'last_name': string | null;
      'phone': string | null;
      'type': string;
      'typeBadge': string | null;
      'updated_at': string;
    };
    nested: {};
    flat: {};
  };
  'documents': {
    plain: {
      'application_id': string | null;
      'id': string;
      'type': string | null;
      'typeBadge': string | null;
      'url': string | null;
      'verificationStatus': string | null;
      'verified': boolean | null;
    };
    nested: {
      'application': Schema['applications']['plain'] & Schema['applications']['nested'];
    };
    flat: {
      'application:applicationAge': string | null;
      'application:customer_id': string | null;
      'application:id': string;
      'application:kyc_level': string | null;
      'application:kycLevelBadge': string | null;
      'application:notes': string | null;
      'application:onboardingStatusBadge': string | null;
      'application:priorityLevel': string | null;
      'application:reviewer': string | null;
      'application:risk_score': number | null;
      'application:riskScoreBadge': string | null;
      'application:sanctions_hits': number | null;
      'application:sanctionsStatus': string | null;
      'application:status': string | null;
      'application:submitted_at': string | null;
    };
  };
  'notes': {
    plain: {
      'author': string | null;
      'body': string | null;
      'created_at': string | null;
      'entity_id': string | null;
      'entity_type': string | null;
      'entityBadge': string | null;
      'id': string;
      'noteAge': string | null;
    };
    nested: {};
    flat: {};
  };
  'transactions': {
    plain: {
      'account_id': string | null;
      'amount_cents': number;
      'amountFormatted': string | null;
      'counterparty': string | null;
      'direction': string;
      'directionBadge': string | null;
      'id': string;
      'merchant_category': string | null;
      'merchantBadge': string | null;
      'occurred_at': string | null;
      'transactionAge': string | null;
    };
    nested: {
      'account': Schema['accounts']['plain'] & Schema['accounts']['nested'];
    };
    flat: {
      'account:balance_cents': number | null;
      'account:balanceFormatted': string | null;
      'account:currency': string | null;
      'account:currencyBadge': string | null;
      'account:customer_id': string | null;
      'account:iban': string | null;
      'account:id': string;
      'account:status': string | null;
      'account:statusBadge': string | null;
      'account:customer:business_name': string | null;
      'account:customer:created_at': string;
      'account:customer:customerSince': string | null;
      'account:customer:email': string;
      'account:customer:first_name': string | null;
      'account:customer:fullName': string | null;
      'account:customer:id': string;
      'account:customer:last_name': string | null;
      'account:customer:phone': string | null;
      'account:customer:type': string;
      'account:customer:typeBadge': string | null;
      'account:customer:updated_at': string;
    };
  };
  'users': {
    plain: {
      'email': string | null;
      'id': string;
      'role': string | null;
      'roleBadge': string | null;
    };
    nested: {};
    flat: {};
  };
};
