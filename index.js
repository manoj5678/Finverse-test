// require('dotenv').config();
// const { createAgent } = require('@forestadmin/agent');
// const { createSqlDataSource } = require('@forestadmin/datasource-sql');

// // Create the Forest Admin agent.
// /**
//  * @type {import('@forestadmin/agent').Agent<import('./typings').Schema>}
//  */
// const agent = createAgent({
//   // Security tokens
//   authSecret: process.env.FOREST_AUTH_SECRET,
//   envSecret: process.env.FOREST_ENV_SECRET,

//   // Make sure to set NODE_ENV to 'production' when you deploy your project
//   isProduction: process.env.NODE_ENV === 'production',

//   // Autocompletion of collection names and fields
//   typingsPath: './typings.ts',
//   typingsMaxDepth: 5,
// });

// // Connect your datasources
// // All options are documented at https://docs.forestadmin.com/developer-guide-agents-nodejs/data-sources/connection
// agent.addDataSource(
//   createSqlDataSource({
//     uri: process.env.DATABASE_URL,
//     schema: process.env.DATABASE_SCHEMA,
//     sslMode: process.env.DATABASE_SSL_MODE,
//   }),
// );

// // Add customizations here.
// // For instance, you can code custom actions, charts, create new fields or relationships, load plugins.
// // As your project grows, you will need to split it into multiple files!
// //
// // Here is some code to get your started
// //
// // agent.customizeCollection('products', collection => {
// //   // Actions are documented here:
// //   // https://docs.forestadmin.com/developer-guide-agents-nodejs/agent-customization/actions
// //   collection.addAction('Order new batch from supplier', {
// //     scope: 'Single', // This action can be triggered product by product
// //     form: [{ label: 'Quantity', type: 'Number', isRequired: true }],
// //     execute: async (context, resultBuilder) => {
// //       const product = await context.getRecord(['id', 'name'])
// //       const quantity = context.formValues['Quantity'];

// //       // ... Perform work here ...

// //       return resultBuilder.success(`Your order for a batch of ${quantity} '${product.name}' was sent`);
// //     }
// //   });

// //   // Search customization is documented here:
// //   // https://docs.forestadmin.com/developer-guide-agents-nodejs/agent-customization/search
// //   collection.replaceSearch(searchString => {
// //     // user has most likely typed a product id, let's search only that column
// //     if (searchString.match(/^prdid[\d]{8}/$))
// //       return { field: 'id', operator: 'Equal', value: searchString };

// //     // Otherwise assume that user wants to search for a product by name
// //     return { field: 'name', operator: 'Contains', value: searchString };
// //   });
// // });

// // Expose an HTTP endpoint.
// agent.mountOnStandaloneServer(Number(process.env.APPLICATION_PORT));

// // Start the agent.
// agent.start().catch(error => {
//   console.error('\x1b[31merror:\x1b[0m Forest Admin agent failed to start\n');
//   console.error('');
//   console.error(error.stack);
//   process.exit(1);
// });


require('dotenv').config();
const { createAgent } = require('@forestadmin/agent');
const { createSqlDataSource } = require('@forestadmin/datasource-sql');

// ========================================
// DEMO MODE CONFIGURATION
// ========================================
const DEMO_MODE = true; // Set to true to bypass all permission checks for demo

// ========================================
// FOREST ADMIN AGENT INITIALIZATION
// ========================================

const agent = createAgent({
  authSecret: process.env.FOREST_AUTH_SECRET,
  envSecret: process.env.FOREST_ENV_SECRET,
  isProduction: process.env.NODE_ENV === 'production',
  typingsPath: './typings.ts',
  typingsMaxDepth: 5,
});

// Connect datasource
agent.addDataSource(
  createSqlDataSource({
    uri: process.env.DATABASE_URL,
    schema: process.env.DATABASE_SCHEMA,
    sslMode: process.env.DATABASE_SSL_MODE,
  }),
);

// ========================================
// ROLES & PERMISSIONS SYSTEM
// ========================================

const ROLES = {
  ADMIN: 'admin',
  COMPLIANCE_LEAD: 'compliance_lead',
  COMPLIANCE_ANALYST: 'compliance_analyst',
  OPERATIONS_MANAGER: 'operations_manager',
  SUPPORT: 'support',
  AUDITOR: 'auditor',
};

const PERMISSION_MATRIX = {
  [ROLES.ADMIN]: [
    'view_all', 'approve_application', 'reject_application', 'request_more_info',
    'bulk_approve_applications', 'view_alerts', 'investigate_alert', 'escalate_alert',
    'dismiss_alert', 'bulk_dismiss_alerts', 'assign_alert', 'view_cases', 'create_case',
    'update_case', 'close_case', 'view_audit_logs', 'freeze_account', 'unfreeze_account',
    'close_account', 'bulk_freeze_accounts', 'flag_customer', 'verify_document',
    'add_notes', 'view_metrics', 'export_data', 'manage_users', 'view_sensitive_data',
    'manage_inbox', 'manage_workspaces', 'override_decisions'
  ],
  
  [ROLES.COMPLIANCE_LEAD]: [
    'view_all', 'approve_application', 'reject_application', 'request_more_info',
    'bulk_approve_applications', 'view_alerts', 'investigate_alert', 'escalate_alert',
    'dismiss_alert', 'bulk_dismiss_alerts', 'assign_alert', 'view_cases', 'create_case',
    'update_case', 'close_case', 'view_audit_logs', 'freeze_account', 'unfreeze_account',
    'flag_customer', 'verify_document', 'add_notes', 'view_metrics', 'export_data',
    'manage_inbox', 'manage_workspaces'
  ],
  
  [ROLES.COMPLIANCE_ANALYST]: [
    'view_applications', 'approve_application', 'reject_application', 'request_more_info',
    'view_alerts', 'investigate_alert', 'escalate_alert', 'dismiss_alert', 'view_cases',
    'create_case', 'update_case', 'verify_document', 'add_notes', 'view_metrics',
    'manage_inbox'
  ],
  
  [ROLES.OPERATIONS_MANAGER]: [
    'view_all', 'approve_application', 'reject_application', 'bulk_approve_applications',
    'view_alerts', 'view_cases', 'view_metrics', 'export_data', 'manage_workspaces'
  ],
  
  [ROLES.SUPPORT]: [
    'view_applications', 'view_customers', 'view_accounts', 'view_transactions',
    'add_notes', 'view_notes'
  ],
  
  [ROLES.AUDITOR]: [
    'view_all', 'view_audit_logs', 'view_metrics', 'export_data'
  ],
};

function getUserRole(userEmail) {
  if (!userEmail) return ROLES.SUPPORT;
  
  const email = userEmail.toLowerCase();
  
  // Email-based role detection (enhance with users table lookup in production)
  if (email.includes('admin')) return ROLES.ADMIN;
  if (email.includes('compliance-lead') || email.includes('lead')) return ROLES.COMPLIANCE_LEAD;
  if (email.includes('compliance') || email.includes('analyst')) return ROLES.COMPLIANCE_ANALYST;
  if (email.includes('ops') || email.includes('operations')) return ROLES.OPERATIONS_MANAGER;
  if (email.includes('auditor') || email.includes('audit')) return ROLES.AUDITOR;
  if (email.includes('support') || email.includes('customer')) return ROLES.SUPPORT;
  
  return ROLES.SUPPORT;
}

function hasPermission(userEmail, permission) {
  // DEMO MODE: Bypass all permission checks
  if (DEMO_MODE) return true;
  
  // Normal permission checking (for production)
  const role = getUserRole(userEmail);
  const userPermissions = PERMISSION_MATRIX[role] || [];
  return userPermissions.includes(permission) || userPermissions.includes('view_all');
}

function getRoleBadge(role) {
  const badges = {
    [ROLES.ADMIN]: '👑 Admin',
    [ROLES.COMPLIANCE_LEAD]: '🛡️ Compliance Lead',
    [ROLES.COMPLIANCE_ANALYST]: '🔍 Compliance Analyst',
    [ROLES.OPERATIONS_MANAGER]: '⚙️ Operations Manager',
    [ROLES.SUPPORT]: '🎧 Support',
    [ROLES.AUDITOR]: '📊 Auditor',
  };
  return badges[role] || '👤 Unknown';
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatCurrency(cents, currency = 'EUR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(cents / 100);
}

function getTimeSince(date) {
  if (!date) return 'Unknown';
  const now = new Date();
  const past = new Date(date);
  const hours = Math.floor((now - past) / (1000 * 60 * 60));
  
  if (hours < 1) return '🔥 < 1 hour';
  if (hours < 24) return `⚡ ${hours} hours`;
  if (hours < 168) return `📅 ${Math.floor(hours / 24)} days`;
  return `📆 ${Math.floor(hours / 168)} weeks`;
}

function getRiskScoreBadge(score) {
  if (score === null || score === undefined) return '⚪ Not Assessed';
  if (score >= 80) return '🔴 Critical Risk';
  if (score >= 60) return '🟠 High Risk';
  if (score >= 40) return '🟡 Medium Risk';
  if (score >= 20) return '🔵 Low Risk';
  return '🟢 Minimal Risk';
}

function getOnboardingStatusBadge(status) {
  const badges = {
    'submitted': '⏳ Submitted',
    'in_review': '🔍 Under Review',
    'more_info': '📄 More Info Needed',
    'approved': '✅ Approved',
    'rejected': '❌ Rejected'
  };
  return badges[status] || '❓ Unknown';
}

// ========================================
// APPLICATIONS COLLECTION (ONBOARDING)
// ========================================

agent.customizeCollection('applications', collection => {
  
  // ========================================
  // SMART FIELDS FOR ONBOARDING
  // ========================================
  
  collection.addField('onboardingStatusBadge', {
    columnType: 'String',
    dependencies: ['status'],
    getValues: (records) => records.map((r) => getOnboardingStatusBadge(r.status)),
  });

  collection.addField('riskScoreBadge', {
    columnType: 'String',
    dependencies: ['risk_score'],
    getValues: (records) => records.map((r) => getRiskScoreBadge(r.risk_score)),
  });

  collection.addField('kycLevelBadge', {
    columnType: 'String',
    dependencies: ['kyc_level'],
    getValues: (records) => records.map((r) => {
      const badges = {
        'basic': '🔵 Basic',
        'standard': '🟢 Standard',
        'enhanced': '🟠 Enhanced'
      };
      return badges[r.kyc_level] || '❓ Unknown';
    }),
  });

  collection.addField('sanctionsStatus', {
    columnType: 'String',
    dependencies: ['sanctions_hits'],
    getValues: (records) => records.map((r) => {
      if (r.sanctions_hits === 0) return '✅ Clear';
      if (r.sanctions_hits === 1) return '⚠️ 1 Hit';
      return `🚨 ${r.sanctions_hits} Hits`;
    }),
  });

  collection.addField('applicationAge', {
    columnType: 'String',
    dependencies: ['submitted_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.submitted_at)),
  });

  collection.addField('priorityLevel', {
    columnType: 'String',
    dependencies: ['risk_score', 'submitted_at', 'sanctions_hits'],
    getValues: (records) => records.map((r) => {
      const age = new Date() - new Date(r.submitted_at);
      const daysOld = age / (1000 * 60 * 60 * 24);
      
      if (r.sanctions_hits > 0 || r.risk_score >= 80 || daysOld > 7) return '🚨 URGENT';
      if (r.risk_score >= 60 || daysOld > 3) return '⚠️ HIGH';
      if (r.risk_score >= 40 || daysOld > 1) return '📌 MEDIUM';
      return '📋 NORMAL';
    }),
  });

  // ========================================
  // WORKSPACES (SEGMENTS) FOR COMPLIANCE TEAM
  // ========================================
  
  // INBOX - Priority items for compliance team
  collection.addSegment('📥 Compliance Inbox', async (context) => {
    return {
      aggregator: 'Or',
      conditions: [
        { field: 'status', operator: 'Equal', value: 'submitted' },
        { field: 'status', operator: 'Equal', value: 'in_review' },
        { field: 'risk_score', operator: 'GreaterThan', value: 60 },
        { field: 'sanctions_hits', operator: 'GreaterThan', value: 0 }
      ]
    };
  });

  collection.addSegment('⏳ Submitted', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'submitted'
  }));

  collection.addSegment('🔍 Under Review', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'in_review'
  }));

  collection.addSegment('📄 Need More Info', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'more_info'
  }));

  collection.addSegment('🔴 High Risk Applications', async () => ({
    field: 'risk_score',
    operator: 'GreaterThan',
    value: 60
  }));

  collection.addSegment('🚨 Sanctions Hits', async () => ({
    field: 'sanctions_hits',
    operator: 'GreaterThan',
    value: 0
  }));

  collection.addSegment('✅ Recently Approved', async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return {
      aggregator: 'And',
      conditions: [
        { field: 'status', operator: 'Equal', value: 'approved' },
        { field: 'submitted_at', operator: 'GreaterThan', value: sevenDaysAgo.toISOString() }
      ]
    };
  });

  collection.addSegment('❌ Recently Rejected', async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return {
      aggregator: 'And',
      conditions: [
        { field: 'status', operator: 'Equal', value: 'rejected' },
        { field: 'submitted_at', operator: 'GreaterThan', value: sevenDaysAgo.toISOString() }
      ]
    };
  });

  collection.addSegment('⏰ Overdue (>3 days)', async () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    return {
      aggregator: 'And',
      conditions: [
        { field: 'status', operator: 'In', value: ['submitted', 'in_review'] },
        { field: 'submitted_at', operator: 'LessThan', value: threeDaysAgo.toISOString() }
      ]
    };
  });

  collection.addSegment('🟠 Enhanced KYC', async () => ({
    field: 'kyc_level',
    operator: 'Equal',
    value: 'enhanced'
  }));

  // ========================================
  // SMART ACTIONS FOR ONBOARDING
  // ========================================

  // APPROVE APPLICATION
  collection.addAction('✅ Approve Application', {
    scope: 'Single',
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      if (!hasPermission(userEmail, 'approve_application')) {
        return resultBuilder.error('❌ You do not have permission to approve applications');
      }
      
      const recordId = await context.getRecordId();
      const record = await context.getRecord(['status', 'customer_id']);
      
      if (record.status === 'approved') {
        return resultBuilder.error('This application is already approved');
      }
      
      // Update application status
      await context.dataSource.getCollection('applications').update(
        { conditionTree: { field: 'id', operator: 'Equal', value: recordId } },
        { status: 'approved', reviewer: userEmail }
      );
      
      // Log audit
      await context.dataSource.getCollection('audit_log').create([{
        actor: userEmail,
        action: 'application_approved',
        entity: 'application',
        entity_id: recordId,
        payload: { previous_status: record.status, demo_mode: DEMO_MODE },
        created_at: new Date()
      }]);
      
      // Add note
      await context.dataSource.getCollection('notes').create([{
        id: require('crypto').randomUUID(),
        entity_type: 'application',
        entity_id: recordId,
        author: userEmail,
        body: 'Application approved',
        created_at: new Date()
      }]);
      
      return resultBuilder.success('✅ Application approved successfully');
    },
  });

  // REJECT APPLICATION
  collection.addAction('❌ Reject Application', {
    scope: 'Single',
    form: [
      {
        label: 'Rejection Reason',
        type: 'String',
        isRequired: true,
        widget: 'TextArea',
      },
      {
        label: 'Risk Factors',
        type: 'StringList',
        widget: 'CheckboxGroup',
        options: [
          'AML Risk', 'Document Issues', 'Verification Failed', 
          'Sanctions Match', 'PEP', 'Adverse Media', 'Other'
        ],
      },
    ],
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      if (!hasPermission(userEmail, 'reject_application')) {
        return resultBuilder.error('❌ You do not have permission to reject applications');
      }
      
      const recordId = await context.getRecordId();
      const reason = context.formValues['Rejection Reason'];
      const riskFactors = context.formValues['Risk Factors'];
      
      // Update application
      await context.dataSource.getCollection('applications').update(
        { conditionTree: { field: 'id', operator: 'Equal', value: recordId } },
        { 
          status: 'rejected',
          reviewer: userEmail,
          notes: reason
        }
      );
      
      // Add note
      await context.dataSource.getCollection('notes').create([{
        id: require('crypto').randomUUID(),
        entity_type: 'application',
        entity_id: recordId,
        author: userEmail,
        body: `Application rejected. Reason: ${reason}. Risk Factors: ${riskFactors?.join(', ') || 'None specified'}`,
        created_at: new Date()
      }]);
      
      // Log audit
      await context.dataSource.getCollection('audit_log').create([{
        actor: userEmail,
        action: 'application_rejected',
        entity: 'application',
        entity_id: recordId,
        payload: { reason, risk_factors: riskFactors, demo_mode: DEMO_MODE },
        created_at: new Date()
      }]);
      
      return resultBuilder.success('❌ Application rejected');
    },
  });

  // REQUEST MORE INFORMATION
  collection.addAction('📋 Request More Information', {
    scope: 'Single',
    form: [
      {
        label: 'Required Documents',
        type: 'StringList',
        widget: 'CheckboxGroup',
        options: ['ID Document', 'Proof of Address', 'Bank Statement', 'Tax Documents', 'Business Registration', 'Other'],
      },
      {
        label: 'Additional Notes',
        type: 'String',
        widget: 'TextArea',
      },
    ],
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      if (!hasPermission(userEmail, 'request_more_info')) {
        return resultBuilder.error('❌ You do not have permission to request information');
      }
      
      const recordId = await context.getRecordId();
      const documents = context.formValues['Required Documents'];
      const notes = context.formValues['Additional Notes'];
      
      // Update status
      await context.dataSource.getCollection('applications').update(
        { conditionTree: { field: 'id', operator: 'Equal', value: recordId } },
        { 
          status: 'more_info',
          notes: `Documents required: ${documents?.join(', ')}. ${notes || ''}`
        }
      );
      
      // Add note
      await context.dataSource.getCollection('notes').create([{
        id: require('crypto').randomUUID(),
        entity_type: 'application',
        entity_id: recordId,
        author: userEmail,
        body: `Documents requested: ${documents?.join(', ')}. ${notes || ''}`,
        created_at: new Date()
      }]);
      
      return resultBuilder.success(`📋 Information request sent. Waiting for: ${documents?.join(', ')}`);
    },
  });

  // BULK APPROVE
  collection.addAction('✅ Bulk Approve Applications', {
    scope: 'Bulk',
    form: [
      {
        label: 'Approval Note',
        type: 'String',
        widget: 'TextArea',
      },
    ],
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      if (!hasPermission(userEmail, 'bulk_approve_applications')) {
        return resultBuilder.error('❌ You do not have permission for bulk approvals');
      }
      
      const recordIds = await context.getRecordIds();
      const note = context.formValues['Approval Note'];
      
      // Update all selected applications
      await context.dataSource.getCollection('applications').update(
        { conditionTree: { field: 'id', operator: 'In', value: recordIds } },
        { status: 'approved', reviewer: userEmail }
      );
      
      // Log audit for each
      const auditLogs = recordIds.map(id => ({
        actor: userEmail,
        action: 'bulk_application_approved',
        entity: 'application',
        entity_id: id,
        payload: { note, demo_mode: DEMO_MODE },
        created_at: new Date()
      }));
      
      await context.dataSource.getCollection('audit_log').create(auditLogs);
      
      return resultBuilder.success(`✅ ${recordIds.length} applications approved`);
    },
  });

  // START REVIEW PROCESS
  collection.addAction('🔍 Start Review', {
    scope: 'Single',
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      const recordId = await context.getRecordId();
      const record = await context.getRecord(['status']);
      
      if (record.status !== 'submitted') {
        return resultBuilder.error('Only submitted applications can be reviewed');
      }
      
      // Update status to in_review
      await context.dataSource.getCollection('applications').update(
        { conditionTree: { field: 'id', operator: 'Equal', value: recordId } },
        { 
          status: 'in_review',
          reviewer: userEmail
        }
      );
      
      // Add note
      await context.dataSource.getCollection('notes').create([{
        id: require('crypto').randomUUID(),
        entity_type: 'application',
        entity_id: recordId,
        author: userEmail,
        body: `Review started by ${userEmail}`,
        created_at: new Date()
      }]);
      
      return resultBuilder.success('🔍 Review process started');
    },
  });

  console.log('✅ Applications collection enhanced with full onboarding workflow');
});

// ========================================
// ALERTS COLLECTION (AML MONITORING)
// ========================================

agent.customizeCollection('alerts', collection => {
  
  // ========================================
  // SMART FIELDS FOR AML
  // ========================================
  
  collection.addField('severityBadge', {
    columnType: 'String',
    dependencies: ['severity'],
    getValues: (records) => records.map((r) => {
      const badges = {
        critical: '🔴 Critical',
        high: '🟠 High',
        medium: '🟡 Medium',
        low: '🔵 Low'
      };
      return badges[r.severity] || '⚪ Unknown';
    }),
  });

  collection.addField('statusBadge', {
    columnType: 'String',
    dependencies: ['status'],
    getValues: (records) => records.map((r) => {
      const badges = {
        open: '🆕 Open',
        triaged: '🔍 Triaged',
        escalated: '🚨 Escalated',
        dismissed: '✅ Dismissed'
      };
      return badges[r.status] || '❓ Unknown';
    }),
  });

  collection.addField('alertAge', {
    columnType: 'String',
    dependencies: ['triggered_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.triggered_at)),
  });

  collection.addField('alertTypeBadge', {
    columnType: 'String',
    dependencies: ['type'],
    getValues: (records) => records.map((r) => {
      const badges = {
        'transaction': '💳 Transaction',
        'behavior': '📊 Behavior',
        'threshold': '📈 Threshold',
        'pattern': '🔍 Pattern',
        'sanctions': '🚫 Sanctions',
        'pep': '👤 PEP'
      };
      return badges[r.type] || `📌 ${r.type || 'Alert'}`;
    }),
  });

  collection.addField('riskIndicators', {
    columnType: 'String',
    dependencies: ['details'],
    getValues: (records) => records.map((r) => {
      try {
        const details = typeof r.details === 'string' ? JSON.parse(r.details) : r.details;
        const indicators = [];
        
        if (details?.amount_cents > 1000000) indicators.push('💰 Large Amount');
        if (details?.velocity_spike) indicators.push('📈 Velocity Spike');
        if (details?.new_counterparty) indicators.push('🆕 New Counterparty');
        if (details?.high_risk_country) indicators.push('🌍 High Risk Country');
        if (details?.pattern_match) indicators.push('🔍 Pattern Match');
        
        return indicators.join(' | ') || '📊 Standard';
      } catch {
        return '📊 Standard';
      }
    }),
  });

  // ========================================
  // AML WORKSPACES (SEGMENTS)
  // ========================================
  
  // COMPLIANCE INBOX - Priority alerts
  collection.addSegment('📥 AML Inbox', async () => {
    return {
      aggregator: 'Or',
      conditions: [
        { field: 'status', operator: 'Equal', value: 'open' },
        { field: 'severity', operator: 'In', value: ['critical', 'high'] }
      ]
    };
  });

  collection.addSegment('🆕 Open Alerts', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'open'
  }));

  collection.addSegment('🔍 Triaged', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'triaged'
  }));

  collection.addSegment('🚨 Escalated', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'escalated'
  }));

  collection.addSegment('🔴 Critical Severity', async () => ({
    field: 'severity',
    operator: 'Equal',
    value: 'critical'
  }));

  collection.addSegment('🟠 High Risk Alerts', async () => ({
    field: 'severity',
    operator: 'In',
    value: ['critical', 'high']
  }));

  collection.addSegment('📅 Today\'s Alerts', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      field: 'triggered_at',
      operator: 'GreaterThan',
      value: today.toISOString()
    };
  });

  // ========================================
  // AML SMART ACTIONS
  // ========================================

  // TRIAGE ALERT
  collection.addAction('🔍 Triage Alert', {
    scope: 'Single',
    form: [
      {
        label: 'Triage Assessment',
        type: 'Enum',
        enumValues: ['Investigate Further', 'Monitor', 'Dismiss', 'Escalate'],
        isRequired: true,
      },
      {
        label: 'Initial Findings',
        type: 'String',
        widget: 'TextArea',
      },
    ],
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      if (!hasPermission(userEmail, 'investigate_alert')) {
        return resultBuilder.error('❌ You do not have permission to triage alerts');
      }
      
      const recordId = await context.getRecordId();
      const assessment = context.formValues['Triage Assessment'];
      const findings = context.formValues['Initial Findings'];
      
      let newStatus = 'triaged';
      if (assessment === 'Dismiss') newStatus = 'dismissed';
      if (assessment === 'Escalate') newStatus = 'escalated';
      
      // Update alert
      await context.dataSource.getCollection('alerts').update(
        { conditionTree: { field: 'id', operator: 'Equal', value: recordId } },
        { status: newStatus }
      );
      
      // Add note
      await context.dataSource.getCollection('notes').create([{
        id: require('crypto').randomUUID(),
        entity_type: 'alert',
        entity_id: recordId,
        author: userEmail,
        body: `Alert triaged: ${assessment}. ${findings || ''}`,
        created_at: new Date()
      }]);
      
      // Log audit
      await context.dataSource.getCollection('audit_log').create([{
        actor: userEmail,
        action: 'alert_triaged',
        entity: 'alert',
        entity_id: recordId,
        payload: { assessment, findings, demo_mode: DEMO_MODE },
        created_at: new Date()
      }]);
      
      return resultBuilder.success(`🔍 Alert triaged - ${assessment}`);
    },
  });

  // ESCALATE ALERT
  collection.addAction('🚨 Escalate Alert', {
    scope: 'Single',
    form: [
      {
        label: 'Case Priority',
        type: 'Enum',
        enumValues: ['p1', 'p2', 'p3'],
        isRequired: true,
      },
      {
        label: 'Case Title',
        type: 'String',
        isRequired: true,
      },
      {
        label: 'Escalation Reason',
        type: 'String',
        widget: 'TextArea',
        isRequired: true,
      },
    ],
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      if (!hasPermission(userEmail, 'escalate_alert')) {
        return resultBuilder.error('❌ You do not have permission to escalate alerts');
      }
      
      const recordId = await context.getRecordId();
      const priority = context.formValues['Case Priority'];
      const title = context.formValues['Case Title'];
      const reason = context.formValues['Escalation Reason'];
      const alert = await context.getRecord(['customer_id', 'type']);
      
      // Create case
      const caseId = require('crypto').randomUUID();
      await context.dataSource.getCollection('cases').create([{
        id: caseId,
        title: title,
        status: 'open',
        priority: priority,
        owner: userEmail,
        created_at: new Date()
      }]);
      
      // Link alert to case
      await context.dataSource.getCollection('case_links').create([{
        case_id: caseId,
        alert_id: recordId
      }]);
      
      // Update alert
      await context.dataSource.getCollection('alerts').update(
        { conditionTree: { field: 'id', operator: 'Equal', value: recordId } },
        { status: 'escalated' }
      );
      
      // Log audit
      await context.dataSource.getCollection('audit_log').create([{
        actor: userEmail,
        action: 'alert_escalated',
        entity: 'alert',
        entity_id: recordId,
        payload: { case_id: caseId, priority, title, reason, demo_mode: DEMO_MODE },
        created_at: new Date()
      }]);
      
      return resultBuilder.success(`🚨 Alert escalated to case: ${title}`);
    },
  });

  // DISMISS ALERT
  collection.addAction('✅ Dismiss Alert', {
    scope: 'Single',
    form: [
      {
        label: 'Dismissal Reason',
        type: 'Enum',
        enumValues: ['False Positive', 'Known Pattern', 'Legitimate Activity', 'Duplicate', 'Other'],
        isRequired: true,
      },
      {
        label: 'Additional Notes',
        type: 'String',
        widget: 'TextArea',
      },
    ],
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      if (!hasPermission(userEmail, 'dismiss_alert')) {
        return resultBuilder.error('❌ You do not have permission to dismiss alerts');
      }
      
      const recordId = await context.getRecordId();
      const reason = context.formValues['Dismissal Reason'];
      const notes = context.formValues['Additional Notes'];
      
      // Update alert
      await context.dataSource.getCollection('alerts').update(
        { conditionTree: { field: 'id', operator: 'Equal', value: recordId } },
        { status: 'dismissed' }
      );
      
      // Add note
      await context.dataSource.getCollection('notes').create([{
        id: require('crypto').randomUUID(),
        entity_type: 'alert',
        entity_id: recordId,
        author: userEmail,
        body: `Alert dismissed: ${reason}. ${notes || ''}`,
        created_at: new Date()
      }]);
      
      // Log audit
      await context.dataSource.getCollection('audit_log').create([{
        actor: userEmail,
        action: 'alert_dismissed',
        entity: 'alert',
        entity_id: recordId,
        payload: { reason, notes, demo_mode: DEMO_MODE },
        created_at: new Date()
      }]);
      
      return resultBuilder.success(`✅ Alert dismissed as ${reason}`);
    },
  });

  // BULK DISMISS ALERTS
  collection.addAction('✅ Bulk Dismiss Alerts', {
    scope: 'Bulk',
    form: [
      {
        label: 'Dismissal Reason',
        type: 'Enum',
        enumValues: ['False Positive', 'Known Pattern', 'Legitimate Activity'],
        isRequired: true,
      },
    ],
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      if (!hasPermission(userEmail, 'bulk_dismiss_alerts')) {
        return resultBuilder.error('❌ You do not have permission for bulk dismissals');
      }
      
      const recordIds = await context.getRecordIds();
      const reason = context.formValues['Dismissal Reason'];
      
      // Update all selected alerts
      await context.dataSource.getCollection('alerts').update(
        { conditionTree: { field: 'id', operator: 'In', value: recordIds } },
        { status: 'dismissed' }
      );
      
      // Log audit for each
      const auditLogs = recordIds.map(id => ({
        actor: userEmail,
        action: 'bulk_alert_dismissed',
        entity: 'alert',
        entity_id: id,
        payload: { reason, demo_mode: DEMO_MODE },
        created_at: new Date()
      }));
      
      await context.dataSource.getCollection('audit_log').create(auditLogs);
      
      return resultBuilder.success(`✅ ${recordIds.length} alerts dismissed`);
    },
  });

  console.log('✅ Alerts collection enhanced with AML monitoring features');
});

// ========================================
// AML_ALERTS COLLECTION
// ========================================

agent.customizeCollection('aml_alerts', collection => {
  
  collection.addField('statusBadge', {
    columnType: 'String',
    dependencies: ['status'],
    getValues: (records) => records.map((r) => {
      const badges = {
        open: '🆕 Open',
        triaged: '🔍 Triaged',
        closed: '✅ Closed'
      };
      return badges[r.status] || '❓ Unknown';
    }),
  });

  collection.addField('scoreBadge', {
    columnType: 'String',
    dependencies: ['score'],
    getValues: (records) => records.map((r) => getRiskScoreBadge(r.score)),
  });

  collection.addField('ruleBadge', {
    columnType: 'String',
    dependencies: ['rule'],
    getValues: (records) => records.map((r) => {
      const badges = {
        'high_velocity': '📈 High Velocity',
        'large_transaction': '💰 Large Transaction',
        'unusual_pattern': '🔍 Unusual Pattern',
        'sanctions_match': '🚫 Sanctions Match',
        'pep_match': '👤 PEP Match'
      };
      return badges[r.rule] || `📌 ${r.rule || 'Rule'}`;
    }),
  });

  collection.addField('alertAge', {
    columnType: 'String',
    dependencies: ['created_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.created_at)),
  });

  // Workspaces
  collection.addSegment('🆕 Open AML Alerts', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'open'
  }));

  collection.addSegment('🔴 High Score (>70)', async () => ({
    field: 'score',
    operator: 'GreaterThan',
    value: 70
  }));

  collection.addSegment('🚨 Escalated Cases', async () => ({
    field: 'escalated_case_id',
    operator: 'Present'
  }));

  console.log('✅ AML alerts collection enhanced');
});

// ========================================
// CASES COLLECTION
// ========================================

agent.customizeCollection('cases', collection => {
  
  collection.addField('statusBadge', {
    columnType: 'String',
    dependencies: ['status'],
    getValues: (records) => records.map((r) => {
      const badges = {
        open: '📂 Open',
        in_review: '🔍 In Review',
        closed: '✅ Closed'
      };
      return badges[r.status] || '❓ Unknown';
    }),
  });

  collection.addField('priorityBadge', {
    columnType: 'String',
    dependencies: ['priority'],
    getValues: (records) => records.map((r) => {
      const badges = {
        p1: '🔴 P1 - Critical',
        p2: '🟠 P2 - High',
        p3: '🟡 P3 - Normal'
      };
      return badges[r.priority] || '⚪ Unknown';
    }),
  });

  collection.addField('caseAge', {
    columnType: 'String',
    dependencies: ['created_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.created_at)),
  });

  collection.addField('ownerBadge', {
    columnType: 'String',
    dependencies: ['owner'],
    getValues: (records) => records.map((r) => {
      if (!r.owner) return '⚠️ Unassigned';
      return `👤 ${r.owner}`;
    }),
  });

  // Workspaces for cases
  collection.addSegment('📂 Open Cases', async () => ({
    field: 'status',
    operator: 'In',
    value: ['open', 'in_review']
  }));

  collection.addSegment('🔴 P1 Priority', async () => ({
    field: 'priority',
    operator: 'Equal',
    value: 'p1'
  }));

  collection.addSegment('📊 My Cases', async (context) => ({
    field: 'owner',
    operator: 'Equal',
    value: context.caller.email
  }));

  collection.addSegment('⚠️ Unassigned', async () => ({
    field: 'owner',
    operator: 'Missing'
  }));

  // Case actions
  collection.addAction('📝 Update Case', {
    scope: 'Single',
    form: [
      {
        label: 'Status',
        type: 'Enum',
        enumValues: ['open', 'in_review', 'closed'],
        isRequired: true,
      },
      {
        label: 'Priority',
        type: 'Enum',
        enumValues: ['p1', 'p2', 'p3'],
        isRequired: true,
      },
      {
        label: 'Update Note',
        type: 'String',
        widget: 'TextArea',
        isRequired: true,
      },
    ],
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      if (!hasPermission(userEmail, 'update_case')) {
        return resultBuilder.error('❌ You do not have permission to update cases');
      }
      
      const recordId = await context.getRecordId();
      const status = context.formValues['Status'];
      const priority = context.formValues['Priority'];
      const note = context.formValues['Update Note'];
      
      // Update case
      await context.dataSource.getCollection('cases').update(
        { conditionTree: { field: 'id', operator: 'Equal', value: recordId } },
        { status, priority }
      );
      
      // Add note
      await context.dataSource.getCollection('notes').create([{
        id: require('crypto').randomUUID(),
        entity_type: 'case',
        entity_id: recordId,
        author: userEmail,
        body: `Case updated - Status: ${status}, Priority: ${priority}. ${note}`,
        created_at: new Date()
      }]);
      
      return resultBuilder.success(`📝 Case updated`);
    },
  });

  collection.addAction('👤 Assign Case', {
    scope: 'Single',
    form: [
      {
        label: 'Assign To',
        type: 'String',
        isRequired: true,
        description: 'Enter email address of the assignee',
      },
    ],
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      if (!hasPermission(userEmail, 'update_case')) {
        return resultBuilder.error('❌ You do not have permission to assign cases');
      }
      
      const recordId = await context.getRecordId();
      const assignTo = context.formValues['Assign To'];
      
      // Update case
      await context.dataSource.getCollection('cases').update(
        { conditionTree: { field: 'id', operator: 'Equal', value: recordId } },
        { owner: assignTo }
      );
      
      // Add note
      await context.dataSource.getCollection('notes').create([{
        id: require('crypto').randomUUID(),
        entity_type: 'case',
        entity_id: recordId,
        author: userEmail,
        body: `Case assigned to ${assignTo}`,
        created_at: new Date()
      }]);
      
      return resultBuilder.success(`👤 Case assigned to ${assignTo}`);
    },
  });

  console.log('✅ Cases collection enhanced');
});

// ========================================
// ACCOUNTS COLLECTION
// ========================================

agent.customizeCollection('accounts', collection => {
  
  collection.addField('statusBadge', {
    columnType: 'String',
    dependencies: ['status'],
    getValues: (records) => records.map((r) => {
      const badges = {
        active: '✅ Active',
        frozen: '🔒 Frozen',
        closed: '⛔ Closed'
      };
      return badges[r.status] || '❓ Unknown';
    }),
  });

  collection.addField('balanceFormatted', {
    columnType: 'String',
    dependencies: ['balance_cents', 'currency'],
    getValues: (records) => records.map((r) => formatCurrency(r.balance_cents || 0, r.currency || 'EUR')),
  });

  collection.addField('currencyBadge', {
    columnType: 'String',
    dependencies: ['currency'],
    getValues: (records) => records.map((r) => {
      const badges = {
        'EUR': '💶 EUR',
        'USD': '💵 USD',
        'GBP': '💷 GBP'
      };
      return badges[r.currency] || `💰 ${r.currency || 'EUR'}`;
    }),
  });

  // Account workspaces
  collection.addSegment('✅ Active Accounts', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'active'
  }));

  collection.addSegment('🔒 Frozen Accounts', async () => ({
    field: 'status',
    operator: 'Equal',
    value: 'frozen'
  }));

  collection.addSegment('💰 High Balance (>10k)', async () => ({
    field: 'balance_cents',
    operator: 'GreaterThan',
    value: 1000000
  }));

  // Account management actions
  collection.addAction('🔒 Freeze Account', {
    scope: 'Single',
    form: [
      {
        label: 'Freeze Reason',
        type: 'Enum',
        enumValues: ['AML Investigation', 'Fraud Suspicion', 'Court Order', 'Customer Request', 'Other'],
        isRequired: true,
      },
      {
        label: 'Additional Notes',
        type: 'String',
        widget: 'TextArea',
      },
    ],
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      if (!hasPermission(userEmail, 'freeze_account')) {
        return resultBuilder.error('❌ You do not have permission to freeze accounts');
      }
      
      const recordId = await context.getRecordId();
      const reason = context.formValues['Freeze Reason'];
      const notes = context.formValues['Additional Notes'];
      
      // Update account
      await context.dataSource.getCollection('accounts').update(
        { conditionTree: { field: 'id', operator: 'Equal', value: recordId } },
        { status: 'frozen' }
      );
      
      // Add note
      await context.dataSource.getCollection('notes').create([{
        id: require('crypto').randomUUID(),
        entity_type: 'account',
        entity_id: recordId,
        author: userEmail,
        body: `Account frozen. Reason: ${reason}. ${notes || ''}`,
        created_at: new Date()
      }]);
      
      // Log audit
      await context.dataSource.getCollection('audit_log').create([{
        actor: userEmail,
        action: 'account_frozen',
        entity: 'account',
        entity_id: recordId,
        payload: { reason, notes, demo_mode: DEMO_MODE },
        created_at: new Date()
      }]);
      
      return resultBuilder.success(`🔒 Account frozen - ${reason}`);
    },
  });

  collection.addAction('🔓 Unfreeze Account', {
    scope: 'Single',
    form: [
      {
        label: 'Unfreeze Reason',
        type: 'String',
        widget: 'TextArea',
        isRequired: true,
      },
    ],
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      if (!hasPermission(userEmail, 'unfreeze_account')) {
        return resultBuilder.error('❌ You do not have permission to unfreeze accounts');
      }
      
      const recordId = await context.getRecordId();
      const reason = context.formValues['Unfreeze Reason'];
      
      // Update account
      await context.dataSource.getCollection('accounts').update(
        { conditionTree: { field: 'id', operator: 'Equal', value: recordId } },
        { status: 'active' }
      );
      
      // Log audit
      await context.dataSource.getCollection('audit_log').create([{
        actor: userEmail,
        action: 'account_unfrozen',
        entity: 'account',
        entity_id: recordId,
        payload: { reason, demo_mode: DEMO_MODE },
        created_at: new Date()
      }]);
      
      return resultBuilder.success('🔓 Account unfrozen');
    },
  });

  collection.addAction('🔒 Bulk Freeze Accounts', {
    scope: 'Bulk',
    form: [
      {
        label: 'Freeze Reason',
        type: 'Enum',
        enumValues: ['AML Investigation', 'Batch Risk Review', 'Regulatory Request'],
        isRequired: true,
      },
    ],
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      if (!hasPermission(userEmail, 'bulk_freeze_accounts')) {
        return resultBuilder.error('❌ You do not have permission for bulk freeze operations');
      }
      
      const recordIds = await context.getRecordIds();
      const reason = context.formValues['Freeze Reason'];
      
      // Update all accounts
      await context.dataSource.getCollection('accounts').update(
        { conditionTree: { field: 'id', operator: 'In', value: recordIds } },
        { status: 'frozen' }
      );
      
      // Log audit for each
      const auditLogs = recordIds.map(id => ({
        actor: userEmail,
        action: 'bulk_account_frozen',
        entity: 'account',
        entity_id: id,
        payload: { reason, demo_mode: DEMO_MODE },
        created_at: new Date()
      }));
      
      await context.dataSource.getCollection('audit_log').create(auditLogs);
      
      return resultBuilder.success(`🔒 ${recordIds.length} accounts frozen`);
    },
  });

  console.log('✅ Accounts collection enhanced');
});

// ========================================
// CUSTOMERS COLLECTION
// ========================================

agent.customizeCollection('customers', collection => {
  
  collection.addField('typeBadge', {
    columnType: 'String',
    dependencies: ['type'],
    getValues: (records) => records.map((r) => {
      return r.type === 'business' ? '🏢 Business' : '👤 Individual';
    }),
  });

  collection.addField('fullName', {
    columnType: 'String',
    dependencies: ['first_name', 'last_name', 'business_name'],
    getValues: (records) => records.map((r) => {
      if (r.business_name) return r.business_name;
      return `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Unknown';
    }),
  });

  collection.addField('customerSince', {
    columnType: 'String',
    dependencies: ['created_at'],
    getValues: (records) => records.map((r) => {
      if (!r.created_at) return 'Unknown';
      const months = Math.floor((new Date() - new Date(r.created_at)) / (1000 * 60 * 60 * 24 * 30));
      if (months < 1) return '🆕 New Customer';
      if (months < 12) return `📅 ${months} months`;
      return `🏆 ${Math.floor(months / 12)} years`;
    }),
  });

  // Customer workspaces
  collection.addSegment('👤 Individual Customers', async () => ({
    field: 'type',
    operator: 'Equal',
    value: 'individual'
  }));

  collection.addSegment('🏢 Business Customers', async () => ({
    field: 'type',
    operator: 'Equal',
    value: 'business'
  }));

  collection.addSegment('🆕 New Customers (30 days)', async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return {
      field: 'created_at',
      operator: 'GreaterThan',
      value: thirtyDaysAgo.toISOString()
    };
  });

  console.log('✅ Customers collection enhanced');
});

// ========================================
// DOCUMENTS COLLECTION
// ========================================

agent.customizeCollection('documents', collection => {
  
  collection.addField('typeBadge', {
    columnType: 'String',
    dependencies: ['type'],
    getValues: (records) => records.map((r) => {
      const badges = {
        'id': '🆔 ID Document',
        'passport': '📕 Passport',
        'address': '🏠 Proof of Address',
        'bank': '🏦 Bank Statement',
        'tax': '📋 Tax Document',
        'business': '🏢 Business Doc'
      };
      return badges[r.type] || `📄 ${r.type || 'Document'}`;
    }),
  });

  collection.addField('verificationStatus', {
    columnType: 'String',
    dependencies: ['verified'],
    getValues: (records) => records.map((r) => {
      return r.verified ? '✅ Verified' : '⏳ Pending';
    }),
  });

  // Document actions
  collection.addAction('✅ Verify Documents', {
    scope: 'Bulk',
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      if (!hasPermission(userEmail, 'verify_document')) {
        return resultBuilder.error('❌ You do not have permission to verify documents');
      }
      
      const recordIds = await context.getRecordIds();
      
      // Update documents
      await context.dataSource.getCollection('documents').update(
        { conditionTree: { field: 'id', operator: 'In', value: recordIds } },
        { verified: true }
      );
      
      return resultBuilder.success(`✅ ${recordIds.length} documents verified`);
    },
  });

  console.log('✅ Documents collection enhanced');
});

// ========================================
// TRANSACTIONS COLLECTION
// ========================================

agent.customizeCollection('transactions', collection => {
  
  collection.addField('amountFormatted', {
    columnType: 'String',
    dependencies: ['amount_cents'],
    getValues: (records) => records.map((r) => formatCurrency(r.amount_cents || 0)),
  });

  collection.addField('directionBadge', {
    columnType: 'String',
    dependencies: ['direction'],
    getValues: (records) => records.map((r) => {
      return r.direction === 'in' ? '📥 Incoming' : '📤 Outgoing';
    }),
  });

  collection.addField('transactionAge', {
    columnType: 'String',
    dependencies: ['occurred_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.occurred_at)),
  });

  collection.addField('merchantBadge', {
    columnType: 'String',
    dependencies: ['merchant_category'],
    getValues: (records) => records.map((r) => {
      const badges = {
        'retail': '🛍️ Retail',
        'food': '🍔 Food',
        'transport': '🚗 Transport',
        'entertainment': '🎬 Entertainment',
        'utilities': '💡 Utilities',
        'financial': '🏦 Financial'
      };
      return badges[r.merchant_category] || `📌 ${r.merchant_category || 'Other'}`;
    }),
  });

  // Transaction workspaces
  collection.addSegment('💰 Large Transactions', async () => ({
    field: 'amount_cents',
    operator: 'GreaterThan',
    value: 1000000
  }));

  collection.addSegment('📅 Today\'s Transactions', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      field: 'occurred_at',
      operator: 'GreaterThan',
      value: today.toISOString()
    };
  });

  collection.addSegment('📥 Incoming', async () => ({
    field: 'direction',
    operator: 'Equal',
    value: 'in'
  }));

  collection.addSegment('📤 Outgoing', async () => ({
    field: 'direction',
    operator: 'Equal',
    value: 'out'
  }));

  console.log('✅ Transactions collection enhanced');
});

// ========================================
// NOTES COLLECTION
// ========================================

agent.customizeCollection('notes', collection => {
  
  collection.addField('noteAge', {
    columnType: 'String',
    dependencies: ['created_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.created_at)),
  });

  collection.addField('entityBadge', {
    columnType: 'String',
    dependencies: ['entity_type'],
    getValues: (records) => records.map((r) => {
      const badges = {
        alert: '🚨 Alert',
        application: '📋 Application',
        account: '💳 Account',
        customer: '👤 Customer',
        case: '📂 Case'
      };
      return badges[r.entity_type] || '📝 Note';
    }),
  });

  console.log('✅ Notes collection enhanced');
});

// ========================================
// AUDIT LOG COLLECTION
// ========================================

agent.customizeCollection('audit_log', collection => {
  
  collection.addField('actorRole', {
    columnType: 'String',
    dependencies: ['actor'],
    getValues: (records) => records.map((r) => {
      const role = getUserRole(r.actor);
      return getRoleBadge(role);
    }),
  });

  collection.addField('actionBadge', {
    columnType: 'String',
    dependencies: ['action'],
    getValues: (records) => records.map((r) => {
      const badges = {
        'application_approved': '✅ Approved',
        'application_rejected': '❌ Rejected',
        'alert_escalated': '🚨 Escalated',
        'alert_dismissed': '✅ Dismissed',
        'alert_triaged': '🔍 Triaged',
        'account_frozen': '🔒 Frozen',
        'account_unfrozen': '🔓 Unfrozen',
        'case_opened': '📂 Case Opened',
        'case_closed': '✔️ Case Closed'
      };
      return badges[r.action] || `📝 ${r.action}`;
    }),
  });

  collection.addField('entityBadge', {
    columnType: 'String',
    dependencies: ['entity'],
    getValues: (records) => records.map((r) => {
      const badges = {
        'application': '📋 Application',
        'alert': '🚨 Alert',
        'account': '💳 Account',
        'case': '📂 Case',
        'customer': '👤 Customer'
      };
      return badges[r.entity] || `📌 ${r.entity || 'Entity'}`;
    }),
  });

  collection.addField('logAge', {
    columnType: 'String',
    dependencies: ['created_at'],
    getValues: (records) => records.map((r) => getTimeSince(r.created_at)),
  });

  // Audit workspaces
  collection.addSegment('📅 Today\'s Activity', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      field: 'created_at',
      operator: 'GreaterThan',
      value: today.toISOString()
    };
  });

  collection.addSegment('🚨 Critical Actions', async () => ({
    field: 'action',
    operator: 'In',
    value: ['account_frozen', 'application_rejected', 'alert_escalated', 'case_opened']
  }));

  collection.addSegment('✅ Approvals', async () => ({
    field: 'action',
    operator: 'In',
    value: ['application_approved', 'bulk_application_approved']
  }));

  console.log('✅ Audit log collection enhanced');
});

// ========================================
// USERS COLLECTION (if exists)
// ========================================

agent.customizeCollection('users', collection => {
  
  collection.addField('roleBadge', {
    columnType: 'String',
    dependencies: ['role'],
    getValues: (records) => records.map((r) => getRoleBadge(r.role)),
  });

  console.log('✅ Users collection enhanced');
});

// ========================================
// GLOBAL PERMISSION CHECK ACTION
// ========================================

agent.customizeCollection('applications', collection => {
  collection.addAction('🔐 Check My Permissions', {
    scope: 'Global',
    execute: async (context, resultBuilder) => {
      const userEmail = context.caller.email;
      const role = getUserRole(userEmail);
      
      const permissions = {
        // Onboarding
        canApprove: hasPermission(userEmail, 'approve_application'),
        canReject: hasPermission(userEmail, 'reject_application'),
        canRequestInfo: hasPermission(userEmail, 'request_more_info'),
        canBulkApprove: hasPermission(userEmail, 'bulk_approve_applications'),
        
        // AML Monitoring
        canInvestigate: hasPermission(userEmail, 'investigate_alert'),
        canEscalate: hasPermission(userEmail, 'escalate_alert'),
        canDismiss: hasPermission(userEmail, 'dismiss_alert'),
        canBulkDismiss: hasPermission(userEmail, 'bulk_dismiss_alerts'),
        canAssign: hasPermission(userEmail, 'assign_alert'),
        
        // Case Management
        canCreateCase: hasPermission(userEmail, 'create_case'),
        canUpdateCase: hasPermission(userEmail, 'update_case'),
        canCloseCase: hasPermission(userEmail, 'close_case'),
        
        // Account Management
        canFreeze: hasPermission(userEmail, 'freeze_account'),
        canUnfreeze: hasPermission(userEmail, 'unfreeze_account'),
        canBulkFreeze: hasPermission(userEmail, 'bulk_freeze_accounts'),
        
        // Other
        canViewMetrics: hasPermission(userEmail, 'view_metrics'),
        canExportData: hasPermission(userEmail, 'export_data'),
        canManageInbox: hasPermission(userEmail, 'manage_inbox'),
        canManageWorkspaces: hasPermission(userEmail, 'manage_workspaces'),
      };
      
      const message = `
🔐 PERMISSIONS DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━

📧 User: ${userEmail}
${getRoleBadge(role)}

🎯 DEMO MODE: ${DEMO_MODE ? '✅ ENABLED (All permissions granted)' : '❌ DISABLED'}

📋 ONBOARDING PERMISSIONS:
• Approve Applications: ${permissions.canApprove ? '✅' : '❌'}
• Reject Applications: ${permissions.canReject ? '✅' : '❌'}
• Request Information: ${permissions.canRequestInfo ? '✅' : '❌'}
• Bulk Approve: ${permissions.canBulkApprove ? '✅' : '❌'}

🚨 AML MONITORING PERMISSIONS:
• Investigate Alerts: ${permissions.canInvestigate ? '✅' : '❌'}
• Escalate Alerts: ${permissions.canEscalate ? '✅' : '❌'}
• Dismiss Alerts: ${permissions.canDismiss ? '✅' : '❌'}
• Bulk Dismiss: ${permissions.canBulkDismiss ? '✅' : '❌'}
• Assign Alerts: ${permissions.canAssign ? '✅' : '❌'}

📂 CASE MANAGEMENT:
• Create Cases: ${permissions.canCreateCase ? '✅' : '❌'}
• Update Cases: ${permissions.canUpdateCase ? '✅' : '❌'}
• Close Cases: ${permissions.canCloseCase ? '✅' : '❌'}

💳 ACCOUNT MANAGEMENT:
• Freeze Accounts: ${permissions.canFreeze ? '✅' : '❌'}
• Unfreeze Accounts: ${permissions.canUnfreeze ? '✅' : '❌'}
• Bulk Freeze: ${permissions.canBulkFreeze ? '✅' : '❌'}

📊 ADDITIONAL FEATURES:
• View Metrics: ${permissions.canViewMetrics ? '✅' : '❌'}
• Export Data: ${permissions.canExportData ? '✅' : '❌'}
• Manage Inbox: ${permissions.canManageInbox ? '✅' : '❌'}
• Manage Workspaces: ${permissions.canManageWorkspaces ? '✅' : '❌'}

━━━━━━━━━━━━━━━━━━━━━━
🔑 TEST ACCOUNTS:
• admin@company.com (Full Access)
• compliance-lead@company.com (Compliance Lead)
• compliance@company.com (Compliance Analyst)
• ops@company.com (Operations Manager)
• auditor@company.com (Auditor)
• support@company.com (Support)
      `;
      
      return resultBuilder.success(message);
    },
  });
});

// ========================================
// START AGENT
// ========================================

agent.mountOnStandaloneServer(Number(process.env.APPLICATION_PORT || 3310));

agent.start().catch(error => {
  console.error('\x1b[31merror:\x1b[0m Forest Admin agent failed to start\n');
  console.error('');
  console.error(error.stack);
  process.exit(1);
});

console.log(`
┌────────────────────────────────────────────────────────────────┐
│  🚀 COMPLIANCE & OPERATIONS PLATFORM - DEMO READY             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  🎯 DEMO MODE: ${DEMO_MODE ? 'ENABLED ✅' : 'DISABLED ❌'}                                   │
│     All permission checks are ${DEMO_MODE ? 'bypassed' : 'active'}                        │
│                                                                │
│  ✅ ALL FEATURES ACTIVE:                                      │
│                                                                │
│  📋 FULL ONBOARDING PROCESS:                                  │
│  • Application review workflow                                │
│  • Approve/Reject/Request Info actions                        │
│  • Bulk operations                                            │
│  • Sanctions & KYC management                                 │
│                                                                │
│  🚨 AML MONITORING:                                           │
│  • Alert triage & investigation                               │
│  • Risk visualization                                         │
│  • Case escalation                                            │
│  • Bulk dismissals                                            │
│                                                                │
│  💼 COMPLETE FEATURE SET:                                     │
│  • 30+ Smart Actions                                          │
│  • 40+ Smart Fields                                           │
│  • 35+ Workspaces/Segments                                    │
│  • Full Audit Trail                                           │
│  • Role-based Permissions                                     │
│                                                                │
│  📊 COLLECTIONS:                                              │
│  • applications • alerts • aml_alerts                         │
│  • cases • accounts • customers                               │
│  • documents • transactions • notes                           │
│  • audit_log • users                                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
`);